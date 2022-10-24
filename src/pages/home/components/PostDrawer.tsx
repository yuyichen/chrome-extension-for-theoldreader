import React, { useContext, useEffect } from "react";
import { Drawer } from "antd";
import { HomeContext } from "../Home";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import services from "@src/services";
import { FromNow } from "@src/utils";
import { debounce } from "lodash";

interface Props {
  hasMore: boolean;
  loadingMore: () => void;
}
const PostDrawer: React.FC<Props> = (props) => {
  const { hasMore, loadingMore } = props;
  const {
    homeState: { feedPosts, selectedPost = {}, csrfToken, refreshFeedsKey },
    setHomeState,
  } = useContext(HomeContext);

  const selectedPostIndex = feedPosts.findIndex(
    (x) => x.id === selectedPost.id
  );

  const scrollToTop = () => {
    document.querySelectorAll("#postBox")[0].scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  const maskAsRead = async (signal: AbortSignal) => {
    const { data } = await services.postRead({
      url: `/posts/${selectedPost.id}/read`,
      method: "post",
      data: {
        _method: "put",
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-Token": csrfToken,
      },
      signal,
    });
    if (data) {
      const newFeedPosts = feedPosts.concat();
      newFeedPosts[selectedPostIndex].unread = false;
      setHomeState({
        feedPosts: newFeedPosts,
        // refreshFeedsKey: refreshFeedsKey + 1,
      });
    }
  };

  useEffect(() => {
    if (selectedPost?.id && selectedPost?.unread) {
      const ac = new AbortController();
      maskAsRead(ac.signal);
      // return () => {
      //   ac.abort();
      // };
    }
  }, [selectedPost?.id]);

  useEffect(() => {
    const keyEvent = debounce((e) => {
      if (feedPosts.length > 0 && selectedPostIndex > -1) {
        switch (true) {
          case e.code === "ArrowRight" &&
            selectedPostIndex < feedPosts.length - 1:
            setHomeState({
              selectedPost: feedPosts[selectedPostIndex + 1],
            });
            scrollToTop();
            break;
          case e.code === "ArrowLeft" && selectedPostIndex > 0:
            setHomeState({
              selectedPost: feedPosts[selectedPostIndex - 1],
            });
            scrollToTop();
            break;
          case ["ArrowDown", "Space"].includes(e.code):
            document
              .querySelectorAll("#postBox")[0]
              .scrollBy({ top: 400, behavior: "smooth" });
            break;
          case ["ArrowUp"].includes(e.code):
            document
              .querySelectorAll("#postBox")[0]
              .scrollBy({ top: -400, behavior: "smooth" });
            break;
        }
      }
    }, 500);
    document.addEventListener("keydown", keyEvent);

    if (hasMore && selectedPostIndex === feedPosts.length - 2) {
      loadingMore();
    }

    return () => document.removeEventListener("keydown", keyEvent);
  }, [selectedPost?.id, JSON.stringify(feedPosts)]);

  return (
    <Drawer
      width={"80vw"}
      open={feedPosts.length > 0 && selectedPostIndex > -1}
      onClose={() => {
        setHomeState({
          selectedPost: undefined,
          refreshFeedsKey: refreshFeedsKey + 1,
        });
      }}
    >
      <div className="flex h-full">
        <div className="flex items-center pl-4 pr-10">
          {selectedPostIndex > 0 && (
            <LeftOutlined
              className="cursor-pointer text-xl"
              onClick={() => {
                setHomeState({
                  selectedPost: feedPosts[selectedPostIndex - 1],
                });
                scrollToTop();
              }}
            />
          )}
        </div>
        <div className="flex-1 overflow-y-auto" id="postBox">
          <a href={selectedPost.origin} target="_blank" rel="noreferrer">
            <h2>{selectedPost.title}</h2>
          </a>
          <div className="text-gray-400 mb-6">
            {/* <a
              href={selectedPost.origin}
              target="_blank"
              rel="noreferrer"
            >
              {selectedPost?.title}
            </a>
            <span className="mx-2">/</span> */}
            <span>
              <FromNow time={selectedPost.time} />
            </span>
          </div>
          <div
            className="post-box"
            dangerouslySetInnerHTML={{ __html: selectedPost?.content }}
          />
        </div>
        <div className="flex items-center pr-4 pl-10">
          {selectedPostIndex < feedPosts.length - 1 && (
            <RightOutlined
              className="cursor-pointer text-xl"
              onClick={() => {
                setHomeState({
                  selectedPost: feedPosts[selectedPostIndex + 1],
                });
                scrollToTop();
              }}
            />
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default PostDrawer;
