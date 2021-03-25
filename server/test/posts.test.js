const crypto = require('crypto');
const axios = require('axios');
const postsService = require('../service/postsService');

const generate = function () {
    return crypto.randomBytes(20).toString('hex');
};

const request = function (url, method, data) {
    return axios({ url, method, data, validateStatus: false });
};

test('should get a post', async function () {
    // given
    const post1 = await postsService.savePost({ title: generate(), content: generate() });
    const post2 = await postsService.savePost({ title: generate(), content: generate() });
    const post3 = await postsService.savePost({ title: generate(), content: generate() });

    // when
    const response = await request('http://localhost:3000/posts', 'get');
    const posts = response.data;

    // then
    expect(posts).toHaveLength(3);
    await postsService.deletePost(post1.id);
    await postsService.deletePost(post2.id);
    await postsService.deletePost(post3.id);
});

test('should save a post', async function () {
    // given
    const data = { title: generate(), content: generate() };
    
    // when
    const response = await request('http://localhost:3000/posts', 'post', data);
    const post = response.data;

    // then
    expect(response.status).toBe(201);
    expect(post.title).toBe(data.title);
    expect(post.content).toBe(data.content);
    await postsService.deletePost(post.id);
});

test('should not save a post', async function () {
    // given
    const data = { title: generate(), content: generate() };
    
    // when
    const response1 = await request('http://localhost:3000/posts', 'post', data);
    const response2 = await request('http://localhost:3000/posts', 'post', data);
    const post = response1.data;

    // then
    expect(response1.status).toBe(201);
    expect(response2.status).toBe(409);
    await postsService.deletePost(post.id);
});

test('should update a post', async function () {
    // given
    const post = await postsService.savePost({ title: generate(), content: generate() });
    post.title = generate();
    post.content = generate();
    
    // when
    const response = await request(`http://localhost:3000/posts/${post.id}`, 'put', post);
    const updatePost = await postsService.getPost(post.id);

    // then
    expect(response.status).toBe(204);
    expect(updatePost.title).toBe(post.title);
    expect(updatePost.content).toBe(post.content);
    await postsService.deletePost(post.id);
});

test('should not update a post', async function () {
    // given
    const post = {
        id: 1
    };

    // when
    const response = await request(`http://localhost:3000/posts/${post.id}`, 'put', post);

    // then
    expect(response.status).toBe(404);
});

test('should delete a post', async function () {
    // given
    const post = await postsService.savePost({ title: generate(), content: generate() });
    
    // when
    const response = await request(`http://localhost:3000/posts/${post.id}`, 'delete');
    const posts = await postsService.getPosts();

    // then
    expect(response.status).toBe(204);
    expect(posts).toHaveLength(0);
});