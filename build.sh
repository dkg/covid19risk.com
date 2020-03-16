#!/bin/bash

BUCKETNAME=covidwatch
FOLDERNAME=
CLOUDFRONT_INVALIDATION_ID=E3DTRHAKABXKO3

AWSPROFILE=$1
NOBUILD=$2

argquit() {
  echo "Please run this script from the root development folder of the nuxt app."
  echo "Syntax: "
  echo "    ./build.sh <awsprofile>"
  echo ""
  echo "    awsprofile: The name of your AWS profile. It should correspond to"
  echo "                a set of credentials in your ~/.aws/credentials"
  echo "                and config in ~/.aws/config files."
  echo ""
  echo "    nobuild: Specify this second argument if you have already performed"
  echo "             \`npm run generate\` and you just want to copy to S3."
  exit 1
}


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


