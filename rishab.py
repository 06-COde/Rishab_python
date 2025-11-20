class FakeAPIService:
    def __init__(self):
        self.db = {"users": []}

    def create_user(self, name, email):
        user = {
            "id": len(self.db["users"]) + 1,
            "name": name,
            "email": email
        }
        self.db["users"].append(user)
        return {"status": "success", "data": user}

    def fetch_users(self):
        return {"status": "success", "data": self.db["users"]}


api = FakeAPIService()
print(api.create_user("John Doe", "john@example.com"))
print(api.fetch_users())
class FakeAPIService:
    def __init__(self):
        self.db = {"users": []}

    def create_user(self, name, email):
        user = {
            "id": len(self.db["users"]) + 1,
            "name": name,
            "email": email
        }
        self.db["users"].append(user)
        return {"status": "success", "data": user}

    def fetch_users(self):
        return {"status": "success", "data": self.db["users"]}


api = FakeAPIService()
print(api.create_user("John Doe", "john@example.com"))
print(api.fetch_users())
class FakeAPIService:
    def __init__(self):
        self.db = {"users": []}

    def create_user(self, name, email):
        user = {
            "id": len(self.db["users"]) + 1,
            "name": name,
            "email": email
        }
        self.db["users"].append(user)
        return {"status": "success", "data": user}

    def fetch_users(self):
        return {"status": "success", "data": self.db["users"]}


api = FakeAPIService()
print(api.create_user("John Doe", "john@example.com"))
print(api.fetch_users())
class FakeAPIService:
    def __init__(self):
        self.db = {"users": []}

    def create_user(self, name, email):
        user = {
            "id": len(self.db["users"]) + 1,
            "name": name,
            "email": email
        }
        self.db["users"].append(user)
        return {"status": "success", "data": user}

    def fetch_users(self):
        return {"status": "success", "data": self.db["users"]}


api = FakeAPIService()
print(api.create_user("John Doe", "john@example.com"))
print(api.fetch_users())
class FakeAPIService:
    def __init__(self):
        self.db = {"users": []}

    def create_user(self, name, email):
        user = {
            "id": len(self.db["users"]) + 1,
            "name": name,
            "email": email
        }
        self.db["users"].append(user)
        return {"status": "success", "data": user}

    def fetch_users(self):
        return {"status": "success", "data": self.db["users"]}


api = FakeAPIService()
print(api.create_user("John Doe", "john@example.com"))
print(api.fetch_users())
