import { useContext, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";
import { Tooltip } from "antd";
import { HomeContext } from "../Home";

dayjs.extend(relativeTime);

const FromNow = ({ time, ...rest }) => {
  const {
    homeState: { currentLang },
  } = useContext(HomeContext);

  useEffect(() => {
    if (currentLang) {
      dayjs.locale(
        {
          zh_CN: "zh-cn",
          en_US: "en",
        }[currentLang] || "zh-cn"
      );
    }
  }, [currentLang]);

  return (
    <Tooltip title={dayjs(time * 1000).format("YYYY-MM-DD HH:mm:ss")}>
      <span {...rest}>{dayjs(time * 1000).fromNow()}</span>
    </Tooltip>
  );
};

export default FromNow;
