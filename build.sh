#!/bin/bash

LIVE_OR_STAGING=$1
AWSPROFILE=$2

argquit() {
  echo "Please run this script from the root development folder of the nuxt app."
  echo "Syntax: "
  echo "    ./build.sh [live|staging] <awsprofile>"
  echo ""
  echo "    live|staging: pick whether to deploy to live or staging"
  echo ""
  echo "    awsprofile: The name of your AWS profile. It should correspond to"
  echo "                a set of credentials in your ~/.aws/credentials"
  echo "                and config in ~/.aws/config files."
  echo ""
  exit 1
}
BUCKETNAME=

if [ -z "$LIVE_OR_STAGING" ]; then
  echo "ERROR: live|staging not selected"
  echo ""
  argquit
fi

if [ "$LIVE_OR_STAGING" = "live" ]; then
  BUCKETNAME=covidwatch
  CLOUDFRONT_INVALIDATION_ID=E3DTRHAKABXKO3
fi

if [ "$LIVE_OR_STAGING" = "staging" ]; then
  BUCKETNAME=covidwatch-staging
  CLOUDFRONT_INVALIDATION_ID=ERB7Y0Z7SNYIM
fi

if [ -z "$BUCKETNAME" ]; then
  echo "ERROR: $LIVE_OR_STAGING is neither live nor staging"
  echo ""
  argquit
fi

if [ -z "$AWSPROFILE" ]; then
  echo "ERROR: <awsprofile> not provided."
  echo ""
  argquit
fi


if [ "$0" != "./build.sh" ]; then
  echo "ERROR: script not invoked in the correct directory."
  echo "Invoked as: $0"
  echo ""
  argquit
fi

echo
echo Using AWS as profile $AWSPROFILE
echo Deploying to: $BUCKETNAME
echo



S3_TARGET_URI="s3://$BUCKETNAME/" 


aws s3 --profile "$AWSPROFILE" cp --recursive site/ "$S3_TARGET_URI" --acl public-read --cache-control max-age=31557600,public --metadata-directive REPLACE --expires 2034-01-01T00:00:00Z



if [ ! -z "$CLOUDFRONT_INVALIDATION_ID" ]; then
  aws cloudfront create-invalidation \
      --profile "$AWSPROFILE" \
      --distribution-id $CLOUDFRONT_INVALIDATION_ID \
      --invalidation-batch "{\"Paths\": {\"Items\": [\"/*\"], \"Quantity\": 1}, \"CallerReference\":\"`date`\"}"
fi


