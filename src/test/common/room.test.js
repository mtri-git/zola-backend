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

    // Create new room
    describe('Create chat room', () => {
        it('should return 201 OK', async () => {
            const response = await request(app)
                .post('/api/v1/room/create')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Test room',
                    isRoom: true,
                    users: ["64afcc49e6dd52128ca621a8", "64afcc02499f7a06f0bba864", "64afcdd81afb580dcd4a6b15"]
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
                .get('/api/v1/room/64afcfa452bc4e7142b3a929')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)
            expect(response.body).toBeDefined();
        }
    )})
    
    
})