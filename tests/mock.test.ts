import { Server } from '../mod.ts';


const app = new Server()


app.route({
  method: 'get',
  path: '/asdf',
  handler: (context) => {
    return context;
  }
})

app.listen({
  onListen: (params) => {
    console.log(`Listening on ${params.hostname}:${params.port}`);
  },
});