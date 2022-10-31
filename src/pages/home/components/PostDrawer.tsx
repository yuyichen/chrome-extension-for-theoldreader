import React, { useContext, useEffect, useState } from "react";
import { Drawer, BackTop, Popover } from "antd";
import { HomeContext } from "../Home";
import { LeftOutlined, RightOutlined, QrcodeOutlined } from "@ant-design/icons";
import FromNow from "./FromNow";
import { debounce } from "lodash";
import useMarkPost from "./useMarkPost";
import qrcode from "qrcode";

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
  const [qrcodeUrl, setQrcodeUrl] = useState();

  const maskAsRead = useMarkPost();

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

  useEffect(() => {
    if (selectedPost?.id && selectedPost?.unread) {
      maskAsRead(selectedPost);
    }
  }, [selectedPost?.id]);

  useEffect(() => {
    if (selectedPost?.origin) {
      qrcode.toDataURL(selectedPost.origin).then((res) => {
        setQrcodeUrl(res);
      });
    }
  }, [selectedPost?.origin]);

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
      title={
        <div className="clearfix">
          <Popover content={<img src={qrcodeUrl} />} placement="bottomRight">
            <QrcodeOutlined className="float-right cursor-pointer" />
          </Popover>
        </div>
      }
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
            dangerouslySetInnerHTML={{
              __html: selectedPost?.content?.replace(
                /href/g,
                "target='_blank' href"
              ),
            }}
          />
          <BackTop target={() => document.querySelector("#postBox")} />
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
