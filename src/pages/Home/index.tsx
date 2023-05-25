import { CrossChainChart, JoinUs } from "src/components/molecules";
import { BaseLayout } from "src/layouts/BaseLayout";
import { Hero } from "./Hero";
import { Statistics } from "./Statistics";
import { TopLists } from "./TopLists";

const Home = () => {
  return (
    <BaseLayout>
      <Hero />
      <Statistics />
      <CrossChainChart />
      <TopLists />
      <JoinUs />
    </BaseLayout>
  );
};

export { Home };
