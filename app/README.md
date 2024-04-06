
# Setup for EC2 server

See [build_server script](./scripts/build_server.sh).

# SSL

I'm roughly following this [tutorial](https://pentacent.medium.com/nginx-and-lets-encrypt-with-docker-in-less-than-5-minutes-b4b8a60d3a71)

The tricky thing is that I'm hosting this on `water.chrisgoldammer.com`, so how do I satisfy the challenge?
- `water.chrisgoldammer.com` is forwarded to the IP for this app using Route53
- Certbot when run from a machine does this:
  a. Ping url
  b. write some challenge to a folder on the machine
  c. If the ping to the URL matches the challenge, then it's good (because it proves I control the machine)


1. Create a `certbot` service
2. Create a `nginx` service:
  - The service uses the `/var/www/certbot` folder to write the certbot challenge
  - ssl secrets are stored like this: `/etc/nginx/ssl/live/water.chrisgoldammer.com/fullchain.pem`
3. Use volumes to ensure that both the challenge and secret location are synced between certbot and nginx.
4. If I run the `certbot` command from the `certbot` instance, roughly this happens:
  - The secret and the challenge are stored on their certbot locations
  - They are synced to the nginx service
  - We do a web request to url. It's forwarded to the machine, and received by nginx. Since nginx has available both the challenge and the secret, it can succesfully resolve the challenge.
  - This requires the 80 port to be open to the world

You run:

```
sudo docker run -it --rm --name certbot \
            -v "/etc/letsencrypt:/etc/letsencrypt" \
            -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
            -p "80:80" \
            certbot/certbot certonly --standalone
```

Then I do some hacky way of copying these from the resulting folder into my laptop, which is then synced from `support/sshkeys` to the server and hosted on nginx. This should be improved obviously.