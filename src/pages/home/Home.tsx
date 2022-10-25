import React, { useEffect, useState, createContext } from "react";
import { ConfigProvider, Layout, Dropdown, Menu } from "antd";
import antd_zh_CN from "antd/es/locale/zh_CN";
import antd_en_US from "antd/es/locale/en_US";
import services from "../../services";
import FeedTree from "./components/FeedTree";
import PostList from "./components/PostList";
import intl from "react-intl-universal";
import * as enUS from "../../locales/en-US.json";
import * as zhCN from "../../locales/zh-CN.json";
import { GlobalOutlined } from "@ant-design/icons";

// locale data
const locales = {
  en_US: enUS,
  zh_CN: zhCN,
};

const initialState = {
  homeState: {
    currentLang: "",
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

const Home = () => {
  const [homeState, setFullHomeState] = useState<typeof initialState.homeState>(
    initialState.homeState
  );

  const setHomeState = (
    particalState: Partial<typeof initialState.homeState>
  ) => {
    setFullHomeState((preState) => ({
      ...preState,
      ...particalState,
    }));
  };

  const [collapsed, setCollapsed] = useState(false);

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

  const loadLocal = (lang?: string) => {
    const newLang = lang || localStorage.getItem("lang") || "zh_CN";
    localStorage.setItem("lang", newLang);

    intl
      .init({
        currentLocale: newLang,
        locales,
      })
      .then(() => {
        setHomeState({
          currentLang: newLang,
        });
      });
  };

  useEffect(() => {
    const timer = setTimeout(getFeeds, 500);
    const autoRefreshTimer = setInterval(getFeeds, 1000 * 60 * 3);

    return () => {
      clearTimeout(timer);
      clearInterval(autoRefreshTimer);
    };
  }, [homeState.refreshFeedsKey]);

  useEffect(() => {
    loadLocal();
  }, []);

  return (
    <ConfigProvider
      locale={
        {
          zh_CN: antd_zh_CN,
          en_US: antd_en_US,
        }[homeState.currentLang]
      }
    >
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
            collapsed={collapsed}
            onCollapse={setCollapsed}
            collapsedWidth={60}
          >
            {!collapsed && <FeedTree />}
          </Layout.Sider>
          <Layout.Content className="flex flex-col">
            <Layout.Header>
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item onClick={() => loadLocal("zh_CN")}>
                      中文
                    </Menu.Item>
                    <Menu.Item onClick={() => loadLocal("en_US")}>
                      English
                    </Menu.Item>
                  </Menu>
                }
              >
                <a className="float-right">
                  <GlobalOutlined className="mr-2" />
                  {intl.get("currentLanguage")}
                </a>
              </Dropdown>
            </Layout.Header>
            <PostList />
          </Layout.Content>
        </Layout>
      </HomeContext.Provider>
    </ConfigProvider>
  );
};

export default Home;
