const prompts = require("prompts");

exports.ask = async function(message, list) {
  const response = await prompts({
    type: "select",
    name: "value",
    message: message,
    choices: list
  });
  return response;
};

exports.askMultiple = async function(message, list) {
  const response = await prompts({
    type: "multiselect",
    name: "value",
    message: message,
    choices: list,
    hint: "- Space to select. Return to submit"
  });
  return response;
};

exports.askConfirm = async function(message) {
  const response = await prompts({
    type: "toggle",
    name: "value",
    message: message,
    active: "Yes",
    inactive: "No"
  });
  return response;
};
