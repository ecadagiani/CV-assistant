import { NotFoundError, ValidationError } from 'adminjs';

export const bulkDeleteAdminJSHandler = (onDelete) => async (request, response, context) => {
  const { records, resource, h } = context;

  if (!records || !records.length) {
    throw new NotFoundError('no records were selected.', 'Action#handler');
  }
  if (request.method === 'get') {
    const recordsInJSON = records.map((record) => record.toJSON(context.currentAdmin));
    return {
      records: recordsInJSON,
    };
  }
  if (request.method === 'post') {
    await Promise.all(records.map((record) => onDelete(record.id(), context)));
    return {
      records: records.map((record) => record.toJSON(context.currentAdmin)),
      notice: {
        message: records.length > 1 ? 'successfullyBulkDeleted_plural' : 'successfullyBulkDeleted',
        options: { count: records.length },
        resourceId: resource.id(),
        type: 'success',
      },
      redirectUrl: h.resourceUrl({ resourceId: resource._decorated?.id() || resource.id() }),
    };
  }
  throw new Error('method should be either "post" or "get"');
};

export const deleteAdminJSHandler = (onDelete) => async (request, response, context) => {
  const {
    record, resource, currentAdmin, h,
  } = context;

  if (!request.params.recordId || !record) {
    throw new NotFoundError([
      'You have to pass "recordId" to Delete Action',
    ].join('\n'), 'Action#handler');
  }

  if (request.method === 'get') {
    return {
      record: record.toJSON(context.currentAdmin),
    };
  }

  try {
    await onDelete(request.params.recordId, context);
  } catch (error) {
    if (error instanceof ValidationError) {
      const baseMessage = error.baseError?.message
        || 'thereWereValidationErrors';
      return {
        record: record.toJSON(currentAdmin),
        notice: {
          message: baseMessage,
          type: 'error',
        },
      };
    }
    throw error;
  }

  return {
    record: record.toJSON(currentAdmin),
    redirectUrl: h.resourceUrl({ resourceId: resource._decorated?.id() || resource.id() }),
    notice: {
      message: 'successfullyDeleted',
      type: 'success',
    },
  };
};
