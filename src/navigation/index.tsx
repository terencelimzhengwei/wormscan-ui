import { lazy, Suspense } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Loader } from "src/components/atoms";
import PolicyPrivacyBanner from "src/components/molecules/PolicyPrivacyBanner";
import { BaseLayout } from "src/layouts/BaseLayout";
import { EnvironmentProvider } from "src/context/EnvironmentContext";
import { ScrollControl } from "src/utils/scrollControl";
import { AnalyticsLinkTracker } from "src/utils/analyticsLinkTracker";
import ErrorBoundary from "src/utils/errorBoundary";

const Home = lazy(() => import("../pages/Home"));
const Tx = lazy(() => import("../pages/Tx"));
const Txs = lazy(() => import("../pages/Txs"));
const NotFound = lazy(() => import("../pages/NotFound"));

const Navigation = () => {
  return (
    <Router>
      <ScrollControl />
      <AnalyticsLinkTracker>
        <EnvironmentProvider>
          <ErrorBoundary>
            {/* TODO: uncomment when we have the privacy policy page <PolicyPrivacyBanner /> */}
            <Suspense
              fallback={
                <BaseLayout>
                  <Loader />
                </BaseLayout>
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/txs" element={<Txs />} />
                <Route path="/tx/:txHash" element={<Tx />} />
                <Route path="/tx/:chainId/:emitter/:seq" element={<Tx />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </EnvironmentProvider>
      </AnalyticsLinkTracker>
    </Router>
  );
};

export { Navigation };
