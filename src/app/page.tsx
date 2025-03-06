

export default async function Home() {
  async function getStockData(symbol: string) {
    const res = await fetch(`http://localhost:3000/api/stock-std?symbol=${symbol}`);
    if (!res.ok) {
      throw new Error("API 호출 실패");
    }
    return res.json();
  }

  const stockData = await getStockData("AAPL");
  console.log(stockData)

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {stockData.longName} : {stockData.strDev}
        <p> {stockData.stdDevPercent}</p>
        <p>거래량 {stockData.sample.meta.regularMarketVolume}</p>
      </main>

    </div>
  );
}
