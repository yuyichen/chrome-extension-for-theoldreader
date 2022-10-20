import { useContext } from "react";
import { Tree, Badge, Spin, Empty, Tooltip } from "antd";
import { HomeContext } from "../Home";
import { SITE_FAVICON_HOST } from "@src/constants";
import { FolderFilled } from "@ant-design/icons";
import "../index.less";

const FeedTree = () => {
  const {
    homeState: { feeds = [], feedsLoading },
    setHomeState,
  } = useContext(HomeContext);

  const selectFeed = (selectedKeys, e) => {
    setHomeState({
      selectedFeed: e?.node?.["data-ref"],
    });
    document.querySelectorAll("#scrollableDiv")[0].scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  const renderTreeNode = (arr: any[]) => {
    return arr.map((x) => {
      return (
        <Tree.TreeNode
          key={x.id}
          className="overflow-hidden"
          data-ref={x}
          icon={
            x.icon ? (
              <img src={`${SITE_FAVICON_HOST}${x.icon}`} />
            ) : (
              <FolderFilled className="text-yellow-400" />
            )
          }
          title={
            <span className="flex overflow-hidden">
              <Tooltip title={x.title}>
                <span className="flex-auto truncate">
                  {x.title || "未命名"}
                </span>
              </Tooltip>
              {x.unread_count > 0 && <Badge count={x.unread_count} />}
            </span>
          }
          selectable={!!x.url}
        >
          {Array.isArray(x.subscriptions) && renderTreeNode(x.subscriptions)}
        </Tree.TreeNode>
      );
    });
  };

  return (
    <Spin spinning={feedsLoading}>
      {feeds.length > 0 ? (
        <Tree
          blockNode
          showIcon
          className="feeds-tree m-2"
          onSelect={selectFeed}
          style={{ paddingBottom: 50 }}
        >
          {renderTreeNode(feeds)}
        </Tree>
      ) : (
        <Empty style={{ marginTop: 100 }} />
      )}
    </Spin>
  );
};

export default FeedTree;
