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
    refreshFeedsKey: 0,
    selectedFeed: undefined,
    feedPosts: [],
    feedPostsLoading: false,
    selectedPost: undefined,
    csrfToken: undefined,
  },
  setHomeState: (arg?: any) => undefined,
  getFeeds: (arg?: any) => undefined,
};

export const HomeContext = createContext(initialState);

let timer: number;
let autoRefreshTimer: number;

const Home = () => {
  const [homeState, setFullHomeState] = useState<typeof initialState.homeState>(
    initialState.homeState
  );

  const setHomeState = (
    particalState: Partial<typeof initialState.homeState>
  ) => {
    setFullHomeState(preState => ({
      ...preState,
      ...particalState,
    }));
  };

  const getFeeds = async (signal: AbortSignal) => {
    setHomeState({
      feedsLoading: true,
    });
    const { data } = await services
      .feeds({
        headers: {
          contentType: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        signal,
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
    timer = setTimeout(getFeeds, 500);
    autoRefreshTimer = setInterval(getFeeds, 1000 * 60 * 3);

    return () => {
      clearTimeout(timer);
      clearInterval(autoRefreshTimer);
      timer = null;
    };
  }, [homeState.refreshFeedsKey]);


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
            collapsible
          >
            <FeedTree />
          </Layout.Sider>
          <Layout.Content className="flex flex-col">
            <PostList />
          </Layout.Content>
        </Layout>
      </HomeContext.Provider>
    </ConfigProvider>
  );
};

export default Home;
