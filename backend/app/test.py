from dotenv import load_dotenv
import os

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv('BACKEND_DATABASE_URL')
print(SQLALCHEMY_DATABASE_URL)
