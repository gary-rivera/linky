required env variables:

https vs http

rate limiting - decision of external library vs. in memory or redis approach

nice to haves:

- directory indexing -> @root, @routes, @controllers, etc.
- wish i could have incorporated better error handling specifically for prisma related writes/reads
-
- trade off of not generating a shortened url for already seen urls but only if user is logged in.
- decision to lock url modification behind user auth. security risk and don't want bad actors to mailiciously port
- uuid instead of incremental ids since they're shared between the frontend and backend.

TIME-SAVE note:

- these were conscious decisions made to avoid time but typically would try better align with industry standard practices

  // checkUrlReachability will look for the frist reachable URL by:
  // perfrom a url -> new URL conversion
  // if that fails basic validation (e.g. invalid domain) its considered invalid -> try next url
  // if it passes, we check reachability
  // if reachability fails, we try the next url
  // if all urls fail, we return isValid = false
  // return is just a boolean, not the final url

  // reachabilityResult takes a list of normalized URLs and returns the first reachable one
  // call checkUrlReachability for each URL
