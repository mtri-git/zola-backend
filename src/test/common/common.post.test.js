// create a simple test to check if the server is running
const request = require('supertest')
const app = require('../../app')

describe('Login to get the accessToken', () => {
	let accessToken
	it('should return 200 OK', async () => {
		const response = await request(app)
			.post('/api/v1/auth/login')
			.send({ username: 'votri', password: '12345' })
			.expect(200)

		accessToken = response.body.token
		expect(response.body.token).toBeDefined()
	})

    describe('Create new post', () => {
        it('should return 201 OK', async () => {
        const response = await request(app)
            .post('/api/v1/post/create')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                content: 'This is a test post #test',
                scope: 'public',
            })
            .expect(201)
        expect(response.body.message).toBe("Post successfully")
        })
    })

    describe('GET post detail /api/post/:id', () => {
        it('should return 200 OK', async () => {
            const response = await request(app)
                .get('/api/v1/post/64b0f8a47fe22dd34976fcb6')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)
        })

        it('should return 400 if id post not valid', async () => {
            const response = await request(app)
                .get('/api/v1/post/64b0f8a47fe22dd34976fcb23121236')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(400)
        });
    })

    describe('Get all post by username', () => {
        it('should return 200 OK', async () => {
            const response = await request(app)
                .get('/api/v1//post/profile/votri')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)
        expect(response.body).toBeDefined();
        })

    });
    
    describe('Get user post in timeline', () => {
        it('should return 200 OK', async () => {
            const response = await request(app)
                .get('/api/v1/post/timeline/votri')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)
        expect(response.body).toBeDefined();
        })
    });

    describe('Like or unlike a post', () => {
        it('should return 200 OK', async () => {
            const response = await request(app)
                .put('/api/v1/post/64b0f8a47fe22dd34976fcb6/like')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)
        })
    })

    describe('Get hot post ', ()=>{
        it('should return 200 OK', async () => {
            const response = await request(app)
                .get('/api/v1/post/hot?pageSize=5&offset=1')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)
            expect(response.body).toBeDefined();
            // expect(response.body.data.length).toBe(5);

        })
    })

    describe('Get recommend post ', ()=>{
        it('should return 200 OK', async () => {
            const response = await request(app)
            .get('/api/v1/post/recommend?limit=5')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)
            expect(response.body).toBeDefined();
    }
    )});

    describe('Search post with text', ()=>{
        it('should return 200 OK', async () => {
            const response = await request(app)
                .get('/api/v1/post?search=a&filter=hot')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)
            expect(response.body).toBeDefined();
        })
    });

    describe('Get all liked post by username', () => {
        it('should return 200 OK', async () => {
            const response = await request(app)
                .get('/api/v1/post/like?username=php&pageSize=2&offset=1')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)
        })
    })

})