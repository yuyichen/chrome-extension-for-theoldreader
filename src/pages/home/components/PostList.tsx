import { useState, useEffect, useContext } from "react";
import {
  List,
  Spin,
  Button,
  Space,
  Typography,
  message,
  Divider,
  Dropdown,
  Menu,
} from "antd";
import { HomeContext } from "../Home";
import services from "@src/services";
import PostDrawer from "./PostDrawer";
import InfiniteScroll from "react-infinite-scroll-component";
import temme from "temme";
import intl from "react-intl-universal";
import useMarkPost from "./useMarkPost";

const PostList: React.FC = () => {
  const {
    homeState: { refreshFeedsKey, feedPosts, selectedFeed, csrfToken },
    setHomeState,
  } = useContext(HomeContext);
  const [loading, setLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [refreshKey, setRefreshKey] = useState(1);
  const [pageContinuation, setPageContinuation] = useState(undefined);
  const maskAsRead = useMarkPost();

  const getPosts = async (signal: AbortSignal, c: any) => {
    const { nextPageUrl, ...rest } = c || {};
    setLoading(true);
    const { data } = await services
      .feedHtml({
        url: nextPageUrl || `/feeds/${selectedFeed?.id}`,
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        signal,
        params: rest,
      })
      .finally(() => {
        setLoading(false);
      });
    const {
      csrfToken: newCsrfToken,
      items,
      nextPage,
    } = temme(
      data,
      `[name=csrf-token][content=$csrfToken];
      #endless@nextPage|pack {
        &[href=$nextPageUrl];
        &[data-last=$last];
        &[data-exclude=$exclude];
        $endless=true;
      };
      [id^=post]@items {
        &[data-identifier=$id];
        &[data-relative=$origin];
        $unread = false;
        &.unread{$unread = true};
        strong{$title};
        .label[data-time=$time|Number];
        .content-body{html($content)};
      }`
    );
    setHomeState({
      feedPosts: nextPageUrl ? feedPosts.concat(items) : items,
      // selectedPost: undefined,
      csrfToken: newCsrfToken || csrfToken,
    });
    setPageContinuation(nextPage);
  };

  const refreshPosts = async () => {
    setLoading(true);
    const res = await services
      .refresh({
        url: `/feeds/${selectedFeed?.id}/refresh`,
        method: "post",
        data: {
          _method: "put",
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-Token": csrfToken,
        },
      })
      .catch((e) => {
        setLoading(false);
      });
    if (res && res.data) {
      setPageContinuation(undefined);
      setRefreshKey(refreshKey + 1);
    }
  };

  const markAsAllRead = async () => {
    setIsMarkingAll(true);
    document.querySelectorAll("#scrollableDiv")[0].scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
    const { data } = await services
      .markAsRead({
        method: "post",
        data: {
          s: `feed/${selectedFeed?.id}`,
        },
      })
      .finally(() => {
        setIsMarkingAll(false);
      });
    if (data === "OK") {
      message.success(intl.get("actionSuccess"));
      const ac = new AbortController();
      getPosts(ac.signal, undefined).then(() => {
        setHomeState({
          refreshFeedsKey: refreshFeedsKey + 1,
        });
      });
    }
  };

  const openInNewTab = (item) => {
    chrome.tabs.create({ url: item.origin }).then(() => maskAsRead(item));
  };

  useEffect(() => {
    if (selectedFeed?.id) {
      const ac = new AbortController();
      getPosts(ac.signal, undefined);
      return () => {
        ac.abort();
      };
    }
  }, [selectedFeed?.id]);

  useEffect(() => {
    if (selectedFeed?.id) {
      const ac = new AbortController();
      getPosts(ac.signal, pageContinuation);
      return () => {
        ac.abort();
      };
    }
  }, [refreshKey]);

  return (
    <div className="flex-auto flex flex-col container mx-auto overflow-hidden">
      <div className="flex items-center p-2 m-2 bg-white">
        <h3 className="flex-auto mb-0">{selectedFeed?.title || "-"}</h3>
        <Space>
          <Button
            loading={loading}
            disabled={!selectedFeed}
            onClick={refreshPosts}
          >
            {intl.get("refresh")}
          </Button>
          <Button
            disabled={!selectedFeed}
            onClick={markAsAllRead}
            loading={isMarkingAll}
          >
            {intl.get("markAllAsRead")}
          </Button>
        </Space>
      </div>
      <div id="scrollableDiv" className="flex-auto overflow-auto">
        <InfiniteScroll
          dataLength={feedPosts.length}
          next={() => {
            setRefreshKey(refreshKey + 1);
          }}
          hasMore={feedPosts.length < 10000 && !!pageContinuation?.nextPageUrl}
          loader={
            loading && (
              <div className="text-center">
                <Spin />
              </div>
            )
          }
          endMessage={
            <Divider plain className="p-2">
              {intl.get("noMoreData")}
            </Divider>
          }
          scrollableTarget="scrollableDiv"
        >
          <List
            className="m-2 mt-0 p-2 bg-white"
            dataSource={feedPosts}
            loading={loading && feedPosts.length === 0}
            itemLayout="horizontal"
            renderItem={(item, index) => {
              const listItemEl = (
                <List.Item
                  className="group cursor-pointer px-4"
                  onClick={() =>
                    setHomeState({
                      selectedPost: item,
                    })
                  }
                >
                  <List.Item.Meta
                    title={
                      <Typography.Text
                        className={item.unread ? "" : "text-gray-400"}
                      >
                        {item.title}
                      </Typography.Text>
                    }
                  />
                </List.Item>
              );
              return (
                <Dropdown
                  trigger={["contextMenu"]}
                  overlay={
                    <Menu>
                      <Menu.Item onClick={() => openInNewTab(item)}>
                        {intl.get("openInNewTab")}
                      </Menu.Item>
                      {item.unread && (
                        <Menu.Item onClick={() => maskAsRead(item)}>
                          {intl.get("markPost")}
                        </Menu.Item>
                      )}
                    </Menu>
                  }
                >
                  {listItemEl}
                </Dropdown>
              );
            }}
          />
        </InfiniteScroll>
      </div>
      <PostDrawer
        hasMore={!!pageContinuation?.nextPageUrl}
        loadingMore={() => {
          setRefreshKey(refreshKey + 1);
        }}
      />
    </div>
  );
};

export default PostList;
