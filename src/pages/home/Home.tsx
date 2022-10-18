import React, { useEffect, useState, createContext } from "react";
import { ConfigProvider, Layout } from "antd";
import zh_CN from "antd/es/locale/zh_CN";
import services from "../../services";
import FeedTree from "./components/FeedTree";

export const HomeContext = createContext<any>(null);

const Home = () => {
  const [homeState, setFullHomeState] = useState({
    feeds: [],
    feedsLoading: false,
  });

  const setHomeState = (particalState: any) => {
    setFullHomeState({
      ...homeState,
      ...particalState,
    });
  };
  const getFeeds = async () => {
    setHomeState({
      feedsLoading: true,
    });
    const { data } = await services
      .feeds({
        headers: {
          contentType: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      })
      .finally(() => {
        setHomeState({
          feedsLoading: false,
        });
      });
    if (data?.feeds) {
      setHomeState({ feeds: data?.feeds });
    }
  };

  useEffect(() => {
    getFeeds();
  }, []);

  return (
    <ConfigProvider locale={zh_CN}>
      <HomeContext.Provider
        value={{
          homeState,
          setHomeState,
          getFeeds,
        }}
      >
        <Layout className="h-full overflow-hidden">
          <Layout.Sider
            width={300}
            theme="light"
            title="RSS"
            className="overflow-auto"
          >
            <FeedTree />
          </Layout.Sider>
          <Layout.Content>
            <Layout.Header></Layout.Header>
          </Layout.Content>
        </Layout>
      </HomeContext.Provider>
    </ConfigProvider>
  );
};

export default Home;
