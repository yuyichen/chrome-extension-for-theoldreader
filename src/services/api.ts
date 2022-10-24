export default {
  feeds: "/feeds",
  feedHtml: "/feeds/:feedId",
  // ids: "/reader/api/0/stream/items/ids?output=json",
  // contents: "/reader/api/0/stream/items/contents?output=json",
  refresh: '/feeds/:feedId/refresh',
  markAsRead: '/reader/api/0/mark-all-as-read',
  postRead: '/posts/:id/read',
  // editTag: '/reader/api/0/edit-tag',
  unReadCount: '/reader/api/0/unread-count?output=json',
};
