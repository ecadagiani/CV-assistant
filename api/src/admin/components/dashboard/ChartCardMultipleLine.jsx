import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import Select from 'react-select';
import ChartCard from './ChartCard';

export function ChartCardMultipleLine({
  title,
  data = [],
  cumulative = false,
}) {
  const [selectValue, setSelectValue] = useState([]);

  const allIds = useMemo(() => {
    const setIds = new Set();
    data.forEach((o) => {
      Object.keys(o.ids || {}).forEach((k) => setIds.add(k));
    });
    return Array.from(setIds);
  }, [data]);

  const selectOptions = useMemo(() => {
    const options = allIds.map((id) => ({ value: id, label: id }));
    setSelectValue((v) => (v.length ? v : options));
    return options;
  }, [allIds]);

  const chartData = useMemo(() => {
    const idsToUse = selectValue.map((v) => v.value);

    if (!cumulative) {
      return [
        ['Date', ...idsToUse],
        ...data.map((o) => [
          o.date,
          ...idsToUse.map((id) => (o.ids || {})[id] || 0),
        ]),
      ];
    }

    const result = data.reduce(({ list, cumulativeIds }, { date, ids }) => {
      if (ids) {
        // update the cumulative values
        allIds.forEach((id) => {
          cumulativeIds[id] = (cumulativeIds[id] || 0) + (ids[id] || 0);
        });
      }
      // return the new values
      return {
        list: [...list, [date, ...idsToUse.map((id) => cumulativeIds[id] || 0)]],
        cumulativeIds,
      };
    }, { list: [], cumulativeIds: {} });

    return [
      ['Date', ...idsToUse],
      ...result.list,
    ];
  }, [selectValue, data, allIds, cumulative]);

  return (
    <ChartCard
      title={title}
      controllers={(
        <Select
          isMulti
          isClearable
          name="IDs"
          options={selectOptions}
          value={selectValue}
          onChange={(v) => setSelectValue(v)}
        />
      )}
      type="chart"
      boxWidth={[1, 1]}
      chartType="LineChart"
      data={chartData}
      options={{
        curveType: 'function',
        legend: { position: 'bottom' },
      }}
    />
  );
}

ChartCardMultipleLine.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string,
    ids: PropTypes.objectOf(PropTypes.number),
  })),
  cumulative: PropTypes.bool,
};

export default ChartCardMultipleLine;
