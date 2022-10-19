import { useState, useEffect, useContext } from "react";
import { Collapse, Spin, Empty } from "antd";
import { HomeContext } from "../Home";
import services from "@src/services";
import qs from "qs";

const PostList: React.FC = () => {
  const {
    homeState: { selectedFeed },
    setHomeState,
  } = useContext(HomeContext);
  const [posts, setPosts] = useState([]);

  const getPosts = async (id: string) => {
    setHomeState({
      feedPostsLoading: true,
    });
    const {
      data: { itemRefs: ids },
    } = await services
      .ids({
        params: {
          s: `feed/${id}`,
        },
      })
      .finally(() => {
        setHomeState({
          feedPostsLoading: false,
        });
      });
    const {
      data: { items },
    } = await services.contents({
      params: {
        i: ids.map((x) => `tag:google.com,2005:reader/item/${x.id}`),
      },
      paramsSerializer: {
        serialize: (params) => qs.stringify(params, { indices: false }),
      },
    });
    if (Array.isArray(items)) {
      setPosts(items);
    }
  };

  useEffect(() => {
    if (selectedFeed?.id) {
      getPosts(selectedFeed?.id);
    }
  }, [selectedFeed?.id]);

  return (
    <div className="flex-auto overflow-auto">
      <h3>{selectedFeed?.title}</h3>
      <Collapse>
        {posts.map((x) => {
          return (
            <Collapse.Panel key={x.id} header={x.title}>
              <div
                dangerouslySetInnerHTML={{ __html: x.summary.content }}
                className="post-box"
              />
            </Collapse.Panel>
          );
        })}
      </Collapse>
    </div>
  );
};

export default PostList;
