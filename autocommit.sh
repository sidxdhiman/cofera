#!/bin/bash

COMMITS=$((RANDOM % 6 + 5))

FILES=("README.md" "notes.txt" "devlog.txt")

MESSAGES=(
"minor update"
"progress update"
"documentation improvement"
"small refactor"
"cleanup"
"notes update"
)

echo "Creating $COMMITS commits..."

for ((i=1;i<=COMMITS;i++))
do
    FILE=${FILES[$RANDOM % ${#FILES[@]}]}
    MSG=${MESSAGES[$RANDOM % ${#MESSAGES[@]}]}

    echo "Update at $(date)" >> $FILE

    git add $FILE
    git commit -m "$MSG"

    sleep $((RANDOM % 4 + 1))
done

git push

echo "Done. $COMMITS commits pushed."