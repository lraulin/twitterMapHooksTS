# Fixes applied to 3-rd party packages

## react-tweet

In react-tweet/lib/Tweet/Text.js line 85:
`if (entities && data.quoted_status) {`
change to:
`if (entities && entities.urls && data.quoted_status) {`
