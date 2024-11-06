import { Box } from '@adminjs/design-system';
import React, { useEffect, useMemo, useState } from 'react';

import { ApiClient, ViewHelpers } from 'adminjs';
import ChartCard from './ChartCard';
import ChartCardMultipleLine from './ChartCardMultipleLine';
import Header from './Header';

function getCumulativeStatsList(stats, cumulativeKeys) {
  if (typeof cumulativeKeys === 'string') {
    cumulativeKeys = [cumulativeKeys];
  }

  const cumulativeData = {};

  const cumulativeStats = stats.map((statObject) => {
    const result = { ...statObject }; // Copy all properties from the original stat object

    cumulativeKeys.forEach((key) => {
      if (!cumulativeData[key]) {
        cumulativeData[key] = 0;
      }
      if (statObject[key]) {
        cumulativeData[key] += statObject[key];
      }
      result[key] = cumulativeData[key]; // Override with cumulative value for specified keys
    });

    return result;
  });
  return cumulativeStats;
}

const emptyStats = {
  nbUsers: 0,
  nbConversations: 0,
  nbMessages: 0,
  averageConversationLength: 0,
  averageConversationLengthPerDayEvolution: [],
  ipCountryRepartition: [],
  originRepartition: [],
  originPerDayEvolution: [],
  nbFallbackNErrorPerDayEvolution: [],
  nbLiveConversationPerDayEvolutionLastMonth: [],
  nbLiveConversationPerDayEvolutionLastYear: [],
  nbNewUserPerDayEvolution: [],
  nbUserAskContactPerDayEvolution: [],
  nbQuestionIdPerDayEvolution: [],
  nbResponseIdPerDayEvolution: [],
};

const getStatsBoxs = (stats) => [
  {
    title: "Nombre d'utilisateurs",
    type: 'number',
    data: stats.nbUsers,
    isLink: true,
    getLink: (h) => h.resourceUrl({ resourceId: 'User' }),
    boxWidth: [1, 1 / 2, 1 / 3, 1 / 4],
  },
  {
    title: 'Nombre de conversations',
    type: 'number',
    data: stats.nbConversations,
    isLink: true,
    getLink: (h) => h.resourceUrl({ resourceId: 'Conversation' }),
    boxWidth: [1, 1 / 2, 1 / 3, 1 / 4],
  },
  {
    title: 'Nombre de messages',
    type: 'number',
    data: stats.nbMessages,
    isLink: true,
    getLink: (h) => h.resourceUrl({ resourceId: 'Message' }),
    boxWidth: [1, 1 / 2, 1 / 3, 1 / 4],
  },
  {
    title: 'Nombre moyen de messages par conversation',
    type: 'number',
    data: (stats?.averageConversationLength || 0).toFixed(1),
    boxWidth: [1, 1 / 2, 1 / 3, 1 / 4],
  },
  {
    title: 'Nombre de generation LLM Large restantes',
    type: 'number',
    data: (stats?.nbLlmLargeGenerationRemaining || 0).toFixed(0),
    boxWidth: [1, 1 / 2],
  },
  {
    title: 'Nombre de generation LLM Slim restantes',
    type: 'number',
    data: (stats?.nbLlmSlimGenerationRemaining || 0).toFixed(0),
    boxWidth: [1, 1 / 2],
  },
  {
    title: 'Timeout, Fallbacks et Erreurs du dernier mois',
    type: 'chart',
    chartType: 'LineChart',
    data: [
      ['Date', 'Nombre de fallbacks (sans llm)', 'Nombre de timeout (llm)', "Nombre d'erreurs"],
      ...(stats.nbFallbackNErrorPerDayEvolution || []).map((o) => [o.date, o.isFallback, o.isLlmTimeout, o.isError]),
    ],
    options: {
      legend: { position: 'bottom' },
    },
    boxWidth: [1],
  },
  {
    title: 'Temps de calcul d\'un message pour le dernier mois',
    type: 'chart',
    chartType: 'LineChart',
    data: [
      [
        'Date',
        'Mediane',
        { id: 'max', type: 'number', role: 'interval' },
        { id: 'min', type: 'number', role: 'interval' },
        { id: 'firstQuartile', type: 'number', role: 'interval' },
        { id: 'median', type: 'number', role: 'interval' },
        { id: 'thirdQuartile', type: 'number', role: 'interval' },
        { id: 'tooltip', type: 'string', role: 'tooltip' },
      ],
      ...(stats.messageProcessDurationPerDayEvolution || []).map((o) => [
        o.date,
        // [firstQuartile, median, thirdQuartile]
        o.processDurationPercentile?.[1],
        o.processDurationMax,
        o.processDurationMin,
        o.processDurationPercentile?.[0],
        o.processDurationPercentile?.[1],
        o.processDurationPercentile?.[2],
        `${o.date}\n`
        + `Max: ${o.processDurationMax}ms\n`
        + `3eme quartile: ${o.processDurationPercentile?.[2]}ms\n`
        + `Mediane: ${o.processDurationPercentile?.[1]}ms\n`
        + `1er quartile: ${o.processDurationPercentile?.[0]}ms\n`
        + `Min: ${o.processDurationMin}ms\n`
        + `Average: ${o.processDurationAvg}ms`,
      ]),
    ],
    options: {
      legend: { position: 'bottom' },
      intervals: {
        barWidth: 1,
        boxWidth: 1,
        lineWidth: 2,
        style: 'boxes',
      },
      interval: {
        max: {
          style: 'bars',
        },
        min: {
          style: 'bars',
        },
      },
      vAxis: {
        scaleType: 'log',
        viewWindow: { min: 0 },
      },
    },
    boxWidth: [1],
  },
  {
    title: 'Nombre de tokens (cumulés) du dernier mois',
    type: 'chart',
    chartType: 'LineChart',
    data: [
      ['Date', 'embeddingTokens', 'largeCompletionTokens', 'slimCompletionTokens', 'nbIntentRequest', 'price ($)',
        { id: 'tooltip', type: 'string', role: 'tooltip' },
      ],
      ...getCumulativeStatsList(stats.pricePerDayEvolution || [], [
        'embeddingTokens',
        'largeCompletionTokens',
        'slimCompletionTokens',
        'nbIntentRequest',
        'price',
      ]).map((o) => [
        o.date, o.embeddingTokens, o.largeCompletionTokens, o.slimCompletionTokens, o.nbIntentRequest, o.price,
        `${o.date}\n`
        + `Embedding: ${o.embeddingTokens}\n`
        + `Large completion: ${o.largeCompletionTokens}\n`
        + `Slim completion: ${o.slimCompletionTokens}\n`
        + `Intent request: ${o.nbIntentRequest}\n`
        + `Price: $${o.price}`,
      ]),
    ],
    options: {
      curveType: 'function',
      legend: { position: 'bottom' },
      series: {
        0: { targetAxisIndex: 0 },
        1: { targetAxisIndex: 0 },
        2: { targetAxisIndex: 0 },
        3: { targetAxisIndex: 0 },
        4: { targetAxisIndex: 1 },
      },
      vAxes: {
        0: { title: 'Tokens / Requests' },
        1: { title: 'Price ($)', format: 'currency' },
      },
      vAxis: {
        0: { viewWindow: { min: 0 }, scaleType: 'log' },
        1: { viewWindow: { min: 0 } },
      },
    },
    boxWidth: [1],
  },
  {
    title: "Nombre de nouveaux utilisateurs (cumulés) de l'année",
    type: 'chart',
    chartType: 'LineChart',
    data: [
      ['Date', 'Nombre de nouveaux utilisateurs'],
      ...getCumulativeStatsList(stats.nbNewUserPerDayEvolution || [], 'count').map((o) => [o.date, o.count]),
    ],
    options: {
      curveType: 'function',
      legend: { position: 'bottom' },
    },
    boxWidth: [1],
  },
  {
    title: 'Pays de provenance des conversations',
    type: 'chart',
    chartType: 'PieChart',
    data: [
      ['Country', 'Nombre de conversations'],
      ...(stats.ipCountryRepartition || []).map((o) => [o.country, o.count]),
    ],
    options: {
      pieHole: 0.4,
      is3D: false,
    },
  },
  {
    title: 'Origine des conversations',
    type: 'chart',
    chartType: 'PieChart',
    data: [
      ['Origine', 'Nombre de conversations'],
      ...(stats.originRepartition || []).map((o) => [o.origin, o.count]),
    ],
    options: {
      pieHole: 0.4,
      is3D: false,
    },
  },
  {
    title: 'Activité du dernier mois',
    type: 'chart',
    chartType: 'LineChart',
    data: [
      ['Date', 'Conversations avec au moins un message ce jour'],
      ...(stats.nbLiveConversationPerDayEvolutionLastMonth || []).map((o) => [o.date, o.count]),
    ],
    options: {
      legend: { position: 'bottom' },
    },
    boxWidth: [1],
  },
  {
    title: 'Activité (cumulé) de la dernière année',
    type: 'chart',
    chartType: 'LineChart',
    data: [
      ['Date', 'Conversations avec au moins un message ce jour'],
      ...getCumulativeStatsList(stats.nbLiveConversationPerDayEvolutionLastYear || [], 'count').map((o) => [o.date, o.count]),
    ],
    options: {
      curveType: 'function',
      legend: { position: 'bottom' },
    },
    boxWidth: [1],
  },
  {
    title: 'Nombre de réponses LLM des 3 derniers mois',
    type: 'chart',
    chartType: 'LineChart',
    data: [
      ['Date', 'Large', 'Slim', 'Cache'],
      ...(stats.nbLlmResponsePerDayEvolution || []).map((o) => [o.date, o.isLargeGenerated, o.isSlimGenerated, o.isCached]),
    ],
    options: {
      legend: { position: 'bottom' },
    },
    boxWidth: [1],
  },
  {
    title: "Longueur moyenne des conversations de l'année",
    type: 'chart',
    chartType: 'LineChart',
    data: [
      ['Date', 'moyenne du nombre de messages'],
      ...(
        (stats.averageConversationLengthPerDayEvolution || []).reduce(({ list, previousAverage }, { date, average }) => {
          // when average is null, we keep the previous average
          if (average) {
            return {
              list: [...list, [date, average]],
              previousAverage: average,
            };
          }
          return {
            list: [...list, [date, previousAverage]],
            previousAverage,
          };
        }, { list: [], previousAverage: 0 })
      ).list,
    ],
    options: {
      curveType: 'function',
      legend: { position: 'bottom' },
    },
    boxWidth: [1],
  },
  {
    title: 'Utilisateurs ayant demandé un contact (cumulés) des 3 derniers mois',
    type: 'chart',
    chartType: 'LineChart',
    data: [
      ['Date', 'Nombre de demandes de contact'],
      ...getCumulativeStatsList(stats.nbUserAskContactPerDayEvolution || [], 'count').map((o) => [o.date, o.count]),
    ],
    options: {
      curveType: 'function',
      legend: { position: 'bottom' },
    },
    boxWidth: [1],
  },
];

export function Dashboard() {
  const [stats, setStats] = useState(emptyStats);
  const h = new ViewHelpers();

  useEffect(() => {
    const api = new ApiClient();
    api.getDashboard()
      .then((response) => {
        console.info(response.data);
        setStats(response.data);
      })
      .catch((error) => {});
  }, []);

  const statsBoxs = useMemo(() => getStatsBoxs(stats), [stats]);

  console.info(stats);
  return (
    <Box>
      <Header />
      <Box
        mt={['xl', 'xl', '-100px']}
        mb="xl"
        mx={[0, 0, 0, 'auto']}
        px={['default', 'lg', 'xxl', '0']}
        position="relative"
        flex
        flexDirection="row"
        flexWrap="wrap"
        width={[1, 1, 1, 1024]}
      >
        {statsBoxs.map((box, index) => (
          <ChartCard
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            title={box.title}
            type={box.type}
            boxWidth={box.boxWidth}
            link={box.getLink ? box.getLink(h) : undefined}
            data={box.data}
            options={box.options}
            chartType={box.chartType}
            chartWidth={box.chartWidth}
            chartHeight={box.chartHeight}
          />
        ))}
        <ChartCardMultipleLine
          title="Origine des conversations (cumulés) des 3 derniers mois"
          data={stats.originPerDayEvolution.map((o) => ({
            date: o.date,
            ids: o.origins,
          }))}
          cumulative
        />
        <ChartCardMultipleLine
          title="Nombre de questionId (cumulés) par jour des 3 derniers mois"
          data={stats.nbQuestionIdPerDayEvolution}
          cumulative
        />
        <ChartCardMultipleLine
          title="Nombre de responseId (cumulés) par jour des 3 derniers mois"
          data={stats.nbResponseIdPerDayEvolution}
          cumulative
        />
      </Box>
    </Box>
  );
}

export default Dashboard;
