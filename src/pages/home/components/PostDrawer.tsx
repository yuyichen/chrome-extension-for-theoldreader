import React, { useContext } from "react";
import { Drawer } from "antd";
import { HomeContext } from "../Home";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const PostDrawer: React.FC = () => {
  const {
    homeState: { feedPosts, selectedPost = {} },
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

  return (
    <Drawer
      width={"80vw"}
      open={feedPosts.length > 0 && selectedPostIndex > -1}
      onClose={() => {
        setHomeState({
          selectedPost: undefined,
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
          <a
            href={selectedPost.alternate?.[0]?.href}
            target="_blank"
            rel="noreferrer"
          >
            <h2>{selectedPost.title}</h2>
          </a>
          <div className="text-gray-400 mb-6">
            <a
              href={selectedPost.origin?.htmlUrl}
              target="_blank"
              rel="noreferrer"
            >
              {selectedPost.origin?.title}
            </a>
            <span className="mx-2">/</span>
            <span>{selectedPost.published}</span>
          </div>
          <div
            className="post-box"
            dangerouslySetInnerHTML={{ __html: selectedPost.summary?.content }}
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
