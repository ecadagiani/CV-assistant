import UserModel from '../../models/user.js';

// eslint-disable-next-line import/prefer-default-export
export async function getAverageUserPerDayForResponse(updatedAtLimit, responseId) {
  const averageUserPerDay = await UserModel.aggregate([
    {
      $match: {
        updatedAt: { $gte: updatedAtLimit },
      },
    },
    {
      $lookup: {
        from: 'conversations',
        localField: 'conversations',
        foreignField: '_id',
        as: 'conversationsData',
      },
    },
    {
      $unwind: '$conversationsData',
    },
    {
      $lookup: {
        from: 'messages',
        localField: 'conversationsData.messages',
        foreignField: '_id',
        as: 'messagesData',
      },
    },
    {
      $match: {
        'messagesData.responseId': responseId,
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        average: { $avg: '$count' },
      },
    },
  ]);
  if (averageUserPerDay.length === 0) {
    return null;
  }

  return averageUserPerDay[0].average;
}
