const typeDic = {
    email: "email",
    phone: "phone"
}

const type = "email"

const opt = {}
opt[typeDic[type]] = type

console.log(opt)