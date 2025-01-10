const { distance } = require("fastest-levenshtein");

module.exports = (sock, label) => {
  if (!sock.commands.size) return;

  const commands = sock.commands
    .filter(({ dev }) => !dev)
    .map((value) => ({
      name: value.name,
      distance: distance(label, value.name),
    }));

  if (!commands.length) return;

  commands.sort((a, b) => a.distance - b.distance);

  if (commands[0].distance >= 4) return;

  return commands[0].name;
};
