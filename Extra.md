User Verification in header.ejs
<!-- <% if(!currentUser){ %>
          <li><a href="/login">SignIn</a></li>
          <li><a href="/register">SignUp</a></li>
          <% } else { %>
          <li><a href="#">Signed in as: <%= currentUser.username %></a></li>
          <li><a href="/logout">SignOut</a></li>
          <% } %> -->



Index.ejs

<!-- 
<div class="item">
  <div class="header">
    <%= question.author %>
  </div>

  <div class="content">
    <a class="header" href="/khojo/<%= question.id %>"><%= question.question %></a>
    <div class="meta">
      <span><%= question.created.toDateString() %></span>
    </div>
    <div class="description">
      <p><%- question.description.substring(0, 100) %>...</p>
    </div>
    <div class="extra">
      <a class="ui violet small basic button" href="/khojo/<%= question._id %>">Read More <i
          class="right chevron icon"></i></a>
    </div>
  </div>
</div> -->