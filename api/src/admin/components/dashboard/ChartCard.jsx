import { Box, H5, Text } from '@adminjs/design-system';
import PropTypes from 'prop-types';
import React from 'react';
import { Chart } from 'react-google-charts';
import { Card, NumberChart } from './styles';

export function ChartCard({
  title,
  type,
  data,
  controllers = undefined,
  boxWidth = [1, 1 / 2],
  link = undefined,
  chartType = '',
  chartWidth = '100%',
  chartHeight = '400px',
  options = {},
}) {
  return (
    <Box width={boxWidth} p="lg">
      <Card
        as={link && 'a'}
        href={link}
      >
        {controllers}
        <Text textAlign="center">
          {type === 'number' && (
            <NumberChart variant="lg">{data}</NumberChart>
          )}
          {type === 'chart' && (
            <Chart
              chartType={chartType}
              width={chartWidth}
              height={chartHeight}
              data={data}
              options={options}
            />
          )}
          <H5 mt="md">{title}</H5>
        </Text>
      </Card>
    </Box>
  );
}

ChartCard.propTypes = {
  controllers: PropTypes.node,
  boxWidth: PropTypes.array,
  link: PropTypes.string,
  type: PropTypes.oneOf(['number', 'chart']).isRequired,
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.number, PropTypes.object]).isRequired,
  chartType: PropTypes.string,
  chartWidth: PropTypes.string,
  chartHeight: PropTypes.string,
  options: PropTypes.object,
  title: PropTypes.string.isRequired,
};

export default ChartCard;
