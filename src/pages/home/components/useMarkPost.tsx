import { useContext } from "react";
import { HomeContext } from "../Home";
import services from "@src/services";

export default () => {
  const {
    homeState: { feedPosts, csrfToken, refreshFeedsKey },
    setHomeState,
  } = useContext(HomeContext);

  const maskAsRead = async (post) => {
    if (!(post?.id && post?.unread)) {
      return;
    }
    const selectedPostIndex = feedPosts.findIndex((x) => x.id === post.id);
    const { data } = await services.postRead({
      url: `/posts/${post.id}/read`,
      method: "post",
      data: {
        _method: "put",
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-Token": csrfToken,
      },
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
  return maskAsRead;
};
