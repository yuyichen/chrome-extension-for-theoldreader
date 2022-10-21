import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";
import { Tooltip } from "antd";

dayjs.locale("zh-cn");
dayjs.extend(relativeTime);

export const FromNow = ({ time, ...rest }) => {
  return (
    <Tooltip title={dayjs(time * 1000).format("YYYY-MM-DD HH:mm:ss")}>
      <span {...rest}>{dayjs(time * 1000).fromNow()}</span>
    </Tooltip>
  );
};
