if [ `git rev-parse --abbrev-ref HEAD` != "master" ]
then
    echo "You need to be on master to publish"
    exit 1
fi

yarn version --patch && git push --atomic git@github.com:momentum-design/tokens.git master `git describe --tags --abbrev=0`
