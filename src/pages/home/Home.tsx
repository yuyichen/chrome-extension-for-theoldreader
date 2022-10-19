import React, { useEffect, useState, createContext } from "react";
import { ConfigProvider, Layout } from "antd";
import zh_CN from "antd/es/locale/zh_CN";
import services from "../../services";
import FeedTree from "./components/FeedTree";
import PostList from "./components/PostList";

const initialState = {
  homeState: {
    feeds: [],
    feedsLoading: false,
    selectedFeed: undefined,
    feedPosts: [],
    feedPostsLoading: false,
    selectedPost: undefined,
  },
  setHomeState: (arg?: any) => undefined,
  getFeeds: (arg?: any) => undefined,
};

export const HomeContext = createContext(initialState);

const Home = () => {
  const [homeState, setFullHomeState] = useState<typeof initialState.homeState>(
    initialState.homeState
  );

  const setHomeState = (
    particalState: Partial<typeof initialState.homeState>
  ) => {
    setFullHomeState({
      ...(homeState as typeof initialState.homeState),
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
          <Layout.Content className="flex flex-col">
            <Layout.Header></Layout.Header>
            <PostList/>
          </Layout.Content>
        </Layout>
      </HomeContext.Provider>
    </ConfigProvider>
  );
};

export default Home;
