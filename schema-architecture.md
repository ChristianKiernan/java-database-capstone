The Spring Boot application uses both MVC and REST controllers. Thymeleaf templates 
are used for the Admin and Doctor dashboards, while REST APIs serve all other 
modules. The application interacts with two databases; MySQL (for patient, doctor, appointment, and admin data)
and MongoDB (for prescriptions). All controllers route requests through a common service layer, which in turn delegates
to the appropriate repositories. MySQL uses JPA entities, while MongoDB uses document models. 

1. User accesses AdminDashboard or Appointment pages
2. The action is routed to the appropriate Thymeleaf or REST controller
3. The controller delegates to the appropriate service layer
4. The service layer interacts with the appropriate repository
5. The repository interacts with the database
6. The database retrieves the appropriate data, and the data is mapped into Java model classes
7. The models are passed to the Thymeleaf templates and rendered as HTML.