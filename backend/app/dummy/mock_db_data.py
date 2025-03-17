# from app.core.logger import logger
# from sqlmodel import Session

# from app.core.database import engine
# from app.api.spar.users.models import User
# from app.api.admin.clients.models import Client


def create_dummy_data():
    # with Session(engine) as session:
    #     admin_user = User(
    #         username="testadmin",
    #         first_name="Test",
    #         last_name="Admin",
    #         email="testadmin@gmail.com",
    #         password="testadmin",
    #         disabled=False,
    #         lang="en-US",
    #         role="admin",
    #         hashed_password="$2a$12$EKcwzg1NPiUJI/kV4dJq.eGBvMGM.lSDywrQ1eRGm.nqqX/yYkX7G",
    #     )
    #     client1 = Client(
    #         created_at="2024-07-12T10:15:40.124809",
    #         last_edited="2019-08-24T14:15:22Z",
    #         name="test",
    #         company="test",
    #         domain="test",
    #         email="test@gmail.com",
    #         site_url="test.com",
    #         locations={"country": "France", "city": "Paris", "branch": "ABC"},
    #         # users=[normal_user],
    #     )
    #     normal_user = User(
    #         username="spardemo",
    #         first_name="Demo",
    #         last_name="User",
    #         email="spardemo@gmail.com",
    #         password="spardemo",
    #         disabled=False,
    #         lang="en-US",
    #         role="user",
    #         hashed_password="$2a$12$H0ketc.boJRprVvfV29DweWc3KjlXOqDEEvgcIzBESC.N/bxQSEUG",
    #         client=client1,
    #     )

    #     session.add_all([admin_user, normal_user, client1])
    #     session.commit()

    #     session.refresh(admin_user)
    #     session.refresh(normal_user)
    #     session.refresh(client1)

    #     logger.info("=========== MOCK DATA CREATED ===========")
    #     logger.debug("Admin user %s", admin_user)
    #     logger.debug("Normal user %s", normal_user)
    #     logger.debug("Normal user's client %s", normal_user.client)

    #     logger.info("===========================================")

    return