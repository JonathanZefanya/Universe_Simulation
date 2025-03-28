import esbuild from 'esbuild'
import config from './common.js'
import {createProxyServer} from './proxy.js'


const ctx = await esbuild.context(config)

// Watch rebuilds docs/ which can interfere with cypress
if (process.env.ESBUILD_WATCH === 'true') {
  await ctx.watch()
}


/**
 * "It's not possible to hook into esbuild's local server to customize
 * the behavior of the server itself. Instead, behavior should be
 * customized by putting a proxy in front of esbuild."
 *
 * We intend to serve on the SERVE_PORT defined above, so run esbuild
 * on the port below it, and use the SERVE_PORT for a proxy.  The
 * proxy handles 404s with the bounce script above.
 *
 * See https://esbuild.github.io/api/#customizing-server-behavior
 */
const SERVE_PORT = 8080
const {hosts, port} = await ctx.serve({
  port: SERVE_PORT - 1,
  servedir: config.outdir,
})
createProxyServer(hosts[0], port).listen(SERVE_PORT)

console.log(`serving on http://localhost:${SERVE_PORT} and happy testing!`)
