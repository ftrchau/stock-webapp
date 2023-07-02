{
    name: "supertrend",
    value: "supertrend",
    groupIndex: 0,
    draw: false,
    apiFunc: "calculateStockSuperTrend",
    parameters: [
      {
        name: "atr_lookback",
        label: "Period",
        value: "14",
        type: "text",
      },
      {
        name: "multiplier",
        label: "Factor",
        value: "2",
        type: "text",
      },
    ],
    charts: [
      {
        name: "Simply Supertrend",
        column: "ST",
        seriesType: "line",
        plotIndexOffset: 0,
        plotIndex: 0,
        index: -1,
        stroke: [
          {
            color: "2 rgb(76, 175, 80)",
            conditions: [
              function ($this, resultIndex, allResult) {
                var condition = false;

                // allResult.reverse();
                if (allResult[resultIndex]["ST_BUY_SELL"] === "BUY")
                  condition = true;
                return condition;
              },
            ],
          },
          {
            color: "2 rgb(255, 82, 82)",
            conditions: [
              function ($this, resultIndex, allResult) {
                var condition = false;

                // allResult.reverse();
                if (allResult[resultIndex]["ST_BUY_SELL"] === "SELL")
                  condition = true;
                return condition;
              },
            ],
          },
        ],
      },
    ],
    annotations: [
      {
        name: "supertrend buy label",
        type: "label",
        plotIndex: 0,
        annotationIndex: [],
        condition: {
          column: "BSIGNAL",
          value: "BUY",
        },
        parameters: {
          valueAnchor: "FLB",
          text: "BSIGNAL",
          fontColor: "#363A45",
        },
        background: {
          fill: "#00E676",
          stroke: "#00E676",
        },
      },
      {
        name: "supertrend buy label",
        type: "label",
        plotIndex: 0,
        annotationIndex: [],
        condition: {
          column: "BSIGNAL",
          value: "BUY",
        },
        parameters: {
          valueAnchor: "FLB",
          text: "BSIGNAL",
          fontColor: "#363A45",
        },
        background: {
          fill: "#00E676",
          stroke: "#00E676",
        },
      },
    ],
  },