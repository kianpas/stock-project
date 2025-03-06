// src/app/api/stock-std/route.ts
import { log } from "console";
import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

// 수익률 배열의 샘플 표준편차 계산 함수
const calculateStd = (returns: number[]): number => {
  const n = returns.length;
  if (n === 0) return 0;
  const mean = returns.reduce((sum, r) => sum + r, 0) / n;
  const variance =
    returns.reduce((acc, r) => acc + (r - mean) ** 2, 0) / (n - 1);
  return Math.sqrt(variance);
};

export async function GET(request: Request) {
  // URL 쿼리 파라미터에서 심볼을 추출 (예: /api/stock-std?symbol=AAPL)
  const { searchParams } = new URL(request.url);
  const stockSymbol = searchParams.get("symbol") || "AAPL";

  try {
    // 1개월 간의 일별 데이터 조회
    const queryOptions = {
      period1: "2024-12-08",
      interval: "1d",
      return: "object",
    };

    // const queryOptions = { period1: '1mo', interval: '1d' } as const;

    const historicalData = await yahooFinance.chart(stockSymbol, queryOptions);

    const sample = historicalData.indicators.quote[0].close;
    const closingPrices = historicalData.indicators.quote[0].close;
    // // 종가 데이터 추출
    // const closingPrices: number[] = historicalData.map(item => historicalData.indicators.quote[0]);
    // // 수익률 계산: (다음 날 종가 - 오늘 종가) / 오늘 종가
    const returns: number[] = [];
    for (let i = 0; i < closingPrices.length - 1; i++) {
      const dailyReturn =
        (closingPrices[i + 1] - closingPrices[i]) / closingPrices[i];
      returns.push(dailyReturn);
    }
    // // 표준편차 계산
    const stdDev = calculateStd(returns);
    const stdDevPercent = (stdDev * 100).toFixed(2); // 1.60%

    //회사명
    const longName = historicalData.meta.longName;

    //현재가격

    //일일변화율
    const dailyVarRateData =
      (historicalData.meta.regularMarketPrice -
        historicalData.meta.chartPreviousClose) /
      historicalData.meta.chartPreviousClose;

    const dailyVarRate = (dailyVarRateData).toFixed(2);

    console.log("dailyVarRate", dailyVarRate);
    //현재가격 대비 52주 최고 대비 하락
    const ftLowerData =
      (historicalData.meta.fiftyTwoWeekHigh -
        historicalData.meta.regularMarketPrice) /
      historicalData.meta.fiftyTwoWeekHigh;
    console.log("ftLowerData", ftLowerData);
    const ftLower = (ftLowerData * 100).toFixed(2);

    console.log("ftLower", ftLower);

    //현재가격 대비 52주 최저 대비 상승
    const ftHigherData =
      (historicalData.meta.regularMarketPrice -
        historicalData.meta.fiftyTwoWeekLow) /
      historicalData.meta.regularMarketDayLow;

    const ftHigher = (ftHigherData * 100).toFixed(2);

    console.log("ftHigher", ftHigher);

    //일일변동폭
    const dailyVarLengthData =
      historicalData.meta.regularMarketDayHigh -
      historicalData.meta.regularMarketDayLow;
    const dailyVarLengthReult =
        dailyVarLengthData / historicalData.meta.regularMarketDayLow;

    const dailyVarLength = (dailyVarLengthReult * 100).toFixed(2);


    console.log("dailyVarLength", dailyVarLength);

    return NextResponse.json({
      symbol: stockSymbol,
      strDev: stdDev,
      stdDevPercent,
      sample: historicalData,
      longName,
      dailyVarRate,
      ftLower,
      ftHigher,
      dailyVarLength,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
