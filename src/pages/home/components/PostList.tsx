import { useState, useEffect, useContext } from "react";
import { List, Skeleton, Button, Space, Typography, message } from "antd";
import { HomeContext } from "../Home";
import services from "@src/services";
import qs from "qs";
import PostDrawer from "./PostDrawer";

const PostList: React.FC = () => {
  const {
    homeState: { feedPosts, selectedFeed },
    setHomeState,
  } = useContext(HomeContext);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(1);
  const [pageContinuation, setPageContinuation] = useState(undefined);

  const getPosts = async (signal: AbortSignal) => {
    setLoading(true);
    const {
      data: { itemRefs: ids, continuation },
    } = await services
      .ids({
        params: {
          s: `feed/${selectedFeed?.id}`,
          c: pageContinuation,
        },
        signal,
      })
      .catch((e) => {
        setLoading(false);
      });
    const {
      data: { items },
    } = await services
      .contents({
        params: {
          i: ids.map((x) => `tag:google.com,2005:reader/item/${x.id}`),
        },
        paramsSerializer: {
          serialize: (params) => qs.stringify(params, { indices: false }),
        },
        signal,
      })
      .finally(() => {
        setLoading(false);
      });
    if (Array.isArray(items)) {
      setHomeState({
        feedPosts: pageContinuation ? feedPosts.concat(items) : items,
        selectedPost: undefined,
      });
      setPageContinuation(continuation);
    }
  };

  const refreshPosts = async () => {
    setLoading(true);
    const { data } = await services
      .refresh({
        url: `/feeds/${selectedFeed?.id}/refresh`,
        method: "post",
        data: {
          _method: "put",
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
        },
      })
      .catch((e) => {
        setLoading(false);
      });
    if (data) {
      setPageContinuation(undefined);
      setRefreshKey(refreshKey + 1);
    }
  };

  const markAsAllRead = async () => {
    const { data } = await services.markAsRead({
      method: "post",
      data: {
        s: `feed/${selectedFeed?.id}`,
      },
    });
    if (data === "OK") {
      message.success("操作成功");
    }
    // TODO 刷新未读数
  };

  useEffect(() => {
    if (selectedFeed?.id) {
      const ac = new AbortController();
      getPosts(ac.signal);
      return () => {
        ac.abort();
        setPageContinuation(undefined);
      };
    }
  }, [selectedFeed?.id, refreshKey]);

  return (
    <div className="flex-auto overflow-auto container mx-auto">
      <div className="flex items-center p-2 m-2 bg-white">
        <h3 className="flex-auto mb-0">{selectedFeed?.title || "-"}</h3>
        <Space>
          <Button loading={loading} disabled={!selectedFeed}>
            刷新
          </Button>
          <Button disabled={!selectedFeed} onClick={markAsAllRead}>
            全部标为已读
          </Button>
        </Space>
      </div>
      <List
        className="m-2 p-2 bg-white"
        dataSource={feedPosts}
        loading={loading}
        itemLayout="horizontal"
        renderItem={(item, index) => {
          return (
            <List.Item
              className="group cursor-pointer px-4"
              onClick={() =>
                setHomeState({
                  selectedPost: item,
                })
              }
            >
              <List.Item.Meta
                title={<Typography.Text>{item.title}</Typography.Text>}
              />
            </List.Item>
          );
        }}
        loadMore={
          selectedFeed &&
          !loading && (
            <div className="text-center my-2">
              <Button
                onClick={() => {
                  setRefreshKey(refreshKey + 1);
                }}
              >
                加载更多
              </Button>
            </div>
          )
        }
      />
      <PostDrawer />
    </div>
  );
};

export default PostList;
