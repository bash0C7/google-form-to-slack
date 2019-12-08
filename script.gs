function sendToSlack(fallback, fields, channel) {
  const url = PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK_URL');
  const data = {
    "channel" : channel,
    "username" : PropertiesService.getScriptProperties().getProperty('SLACK_SCREEN_NAME'),  // 1: bot 名
    "attachments" : [{
      "fallback" : fallback,
      "text" : PropertiesService.getScriptProperties().getProperty('SLACK_MESSAGE_TITLE'),
      "fields": fields,
      "color": "good",  // 3: 左線の色
    }],
    "icon_emoji" : ":envelope_with_arrow:"  // 2: アイコン画像
  };
  const payload = JSON.stringify(data);
  const options = {
    "method" : "POST",
    "contentType" : "application/json",
    "payload" : payload,
    "muteHttpExceptions": true,
  };
  const response = UrlFetchApp.fetch(url, options);
}

function test() {
  sendToSlack("テスト通知確認です", [], PropertiesService.getScriptProperties().getProperty('SLACK_CHANNEL_TEST'));
}

function responseToText(itemResponse) {
  switch (itemResponse.getItem().getType()) {
    case FormApp.ItemType.CHECKBOX:
      return itemResponse.getResponse().join("\n");
      break;
    case FormApp.ItemType.GRID:
      const gridResponses = itemResponse.getResponse();
      return itemResponse.getItem().asGridItem().getRows().map(function(rowName, index) {
        Logger.log(rowName);
        return rowName + ": " + gridResponses[index];
      }).join("\n");
      break;
    case FormApp.ItemType.CHECKBOX_GRID:
      const checkboxGridResponses = itemResponse.getResponse()
      return itemResponse.getItem().asCheckboxGridItem().getRows().map(function(rowName, index) {
        Logger.log(rowName);
        return rowName + ": " + checkboxGridResponses[index];
      }).join("\n");
      break;
    default:
      return itemResponse.getResponse();
  }
}

function onFormSubmit(e){
  const itemResponses = e.response.getItemResponses();

  const fallback = itemResponses.map(function(itemResponse) {
    return itemResponse.getItem().getTitle() + ": " + itemResponse.getResponse();
  }).join("\n");

  const fields = itemResponses.map(function(itemResponse) {
    const value = responseToText(itemResponse);
    return {
      "title": itemResponse.getItem().getTitle(),
      "value": value,
      "short": false,  // 4: 左右２列で表示
    }
  });

  sendToSlack(fallback, fields, PropertiesService.getScriptProperties().getProperty('SLACK_CHANNEL'));
}
