# Slack notifications run server-side through a bot, not a client webhook

The spec posted new Comments to a Slack incoming webhook from the browser. That fails three ways: the webhook URL would ship in the public bundle (anyone could post to the channel), incoming webhooks don't return the message id needed to thread status-change Replies, and a client-side 5-second undo delay is lost if the tab closes. Instead a scheduled Supabase Edge Function posts Comments older than the undo window with a Slack bot token, stores the returned message id on the Comment, and replies in that thread for each status change in `comment_events`.

## Consequences

Slack learns of a Comment 5–60 seconds after posting, not exactly at 5. A Slack admin must install a bot app rather than create a webhook.
