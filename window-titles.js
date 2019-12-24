const { execSync } = require('child_process')

const setTitleWindows = core => {
  const { command } = core.activeProcess || {}
  const title = command.raw
  process.stdout.write("\033]30;" + `${process.cwd().split('/').pop()}: ${title}` + "\007")
}

const setTitleUnix = core => {
  const tty = execSync('tty', { stdio: ['inherit', 'pipe', 'pipe'] }).toString().trim()
  const processList = execSync(`ps -t ${tty} -o pid,comm,etimes`)
    .toString().split('\n').slice(1)
    .map(line => line.trim()).filter(Boolean)
    .map(line => line.split(' ').map(t => t.trim()).filter(Boolean))
    .map(([pid, comm, etimes]) => ({ pid, comm, etimes }))
    .sort((a, b) => Number(a.etimes) - Number(b.etimes))
  if (processList[0].comm == 'ps') processList.shift()
  const { comm } = processList.shift()
  process.stdout.write("\033]30;" + `${process.cwd().split('/').pop()}: ${comm}` + "\007")
}

const setTitle = core => {
  if (process.platform == 'win32') return setTitleWindows(core)
  // assume unix
  return setTitleUnix(core)
}

module.exports = core => {
  core.config.onProcessStart.push(() => {
    setTitle(core)
  })
  // there should be a better way!
  setInterval(setTitle, 100)
}