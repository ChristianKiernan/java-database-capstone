The Spring Boot application uses both MVC and REST controllers. At the 
view level, Thymeleaf templates are used to display two dashboards, one for 
admin and the other for doctors. REST APIs serve the other 
modules.

The application uses MySQL (JPA entities) for patient, doctor, appointment, and admin data. It also uses
MongoDB to handle the unstructured nature of patient prescriptions (document models). 
Controllers route requests through a single service layer. The service layer delegates
to the appropriate repositories.

1. User accesses AdminDashboard or Appointment pages
2. The action is routed to the appropriate Thymeleaf or REST controller
3. The controller delegates to the appropriate service layer
4. The service layer interacts with the appropriate repository
5. The repository interacts with the database
6. The database retrieves the appropriate data, and the data is mapped into Java model classes
7. The models are passed to the Thymeleaf templates and rendered as HTML.