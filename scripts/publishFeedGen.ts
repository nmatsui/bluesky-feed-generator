import dotenv from 'dotenv'
import { AtpAgent, BlobRef } from '@atproto/api'
import fs from 'fs/promises'
import { ids } from '../src/lexicon/lexicons'

const run = async () => {
  dotenv.config()

  // YOUR bluesky handle
  if (!process.env.FEEDGEN_PUBLISH_HANDLE) {
    throw new Error('Please provide your bluesky handle in the .env file')
  }
  const handle = process.env.FEEDGEN_PUBLISH_HANDLE

  // YOUR bluesky password, or preferably an App Password (found in your client settings)
  if (!process.env.FEEDGEN_PUBLISH_PASSWORD) {
    throw new Error('Please provide your bluesky password in the .env file')
  }
  const password = process.env.FEEDGEN_PUBLISH_PASSWORD

  // A short name for the record that will show in urls
  // Lowercase with no spaces.
  // Ex: whats-hot
  const recordName = 'whats-weather'

  // A display name for your feed
  // Ex: What's Hot
  const displayName = '天気はどう？'

  // (Optional) A description of your feed
  // Ex: Top trending content from the whole network
  const description = '"天気"についての話題を集めるフィード（feed generatorのテスト用）'

  // (Optional) The path to an image to be used as your feed's avatar
  // Ex: ~/path/to/avatar.jpeg
  const avatar: string = ''

  // -------------------------------------
  // NO NEED TO TOUCH ANYTHING BELOW HERE
  // -------------------------------------

  if (!process.env.FEEDGEN_SERVICE_DID && !process.env.FEEDGEN_HOSTNAME) {
    throw new Error('Please provide a hostname in the .env file')
  }
  const feedGenDid =
    process.env.FEEDGEN_SERVICE_DID ?? `did:web:${process.env.FEEDGEN_HOSTNAME}`

  // only update this if in a test environment
  const agent = new AtpAgent({ service: 'https://bsky.social' })
  await agent.login({ identifier: handle, password })

  let avatarRef: BlobRef | undefined
  if (avatar) {
    let encoding: string
    if (avatar.endsWith('png')) {
      encoding = 'image/png'
    } else if (avatar.endsWith('jpg') || avatar.endsWith('jpeg')) {
      encoding = 'image/jpeg'
    } else {
      throw new Error('expected png or jpeg')
    }
    const img = await fs.readFile(avatar)
    const blobRes = await agent.api.com.atproto.repo.uploadBlob(img, {
      encoding,
    })
    avatarRef = blobRes.data.blob
  }

  await agent.api.com.atproto.repo.putRecord({
    repo: agent.session?.did ?? '',
    collection: ids.AppBskyFeedGenerator,
    rkey: recordName,
    record: {
      did: feedGenDid,
      displayName: displayName,
      description: description,
      avatar: avatarRef,
      createdAt: new Date().toISOString(),
    },
  })

  console.log('All done 🎉')
}

run()
