const request = require('supertest')
const app = require('../../app')

describe('Room API for user', () => {
	let accessToken
	it('login to get accessToken', async () => {
		const response = await request(app)
			.post('/api/v1/auth/login')
			.send({ username: 'votri', password: '12345' })
			.expect(200)

		accessToken = response.body.token
		expect(response.body.token).toBeDefined()
	})

    // Create new room
    describe('Create chat room', () => {
        it('should return 201 OK', async () => {
            const response = await request(app)
                .post('/api/v1/room/create')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Test room',
                    isRoom: true,
                    users: ["64b0f6272a5cc5d721f0ee1b", "64b0f60cfc5c5332aa86acb2"]
                })
                .expect(201)
        })
    })

    // Get all room
    describe('Get all room by user', () => {
        it('should return 200 OK', async () => {
            const response = await request(app)
                .get('/api/v1/room')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)
                expect(response.body).toBeDefined();
            
        });
    });

    // Get user in room
    describe('Get user in room', () => {
        it('should return 200 OK', async () => {
            const response = await request(app)
                .get('/api/v1/room/64b0fd79a930301778587e77')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)
            expect(response.body).toBeDefined();
        }
    )})
    
    
})