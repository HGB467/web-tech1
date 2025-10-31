$(document).ready(function() {

    const apiUrl = 'https://jsonplaceholder.typicode.com/posts';
    const postModal = new bootstrap.Modal(document.getElementById('post-modal'));
    const postsList = $('#posts-list');
    const postForm = $('#post-form');
    const alertPlaceholder = $('#alert-placeholder');
    const loadingSpinner = $('#loading-spinner');

    function showLoading() {
        loadingSpinner.show();
    }

    function hideLoading() {
        loadingSpinner.hide();
    }

    function showAlert(message, type) {
        const alertHtml = '<div class="alert alert-' + type + ' alert-dismissible fade show">' +
                        message +
                        '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
                        '</div>';
        alertPlaceholder.html(alertHtml);
    }

    function createPostRowHtml(post) {
        return '<tr data-id="' + post.id + '">' +
                    '<td class="post-title">' + post.title + '</td>' +
                    '<td class="post-body">' + post.body + '</td>' +
                    '<td class="actions-column">' +
                        '<button class="btn btn-sm btn-warning btn-edit me-2">Edit</button>' +
                        '<button class="btn btn-sm btn-danger btn-delete">Delete</button>' +
                    '</td>' +
                '</tr>';
    }

    function fetchPosts() {
        showLoading();
        $.ajax({
            url: apiUrl,
            method: 'GET',
            success: function(posts) {
                hideLoading();
                postsList.empty();
                const postsToDisplay = posts.slice(0, 10);
                postsToDisplay.forEach((post) => {
                    const rowHtml = createPostRowHtml(post);
                    postsList.append(rowHtml);
                });
            },
            error: function(error) {
                hideLoading();
                showAlert('Error fetching posts. Please try again.', 'danger');
                console.error('Error:', error);
            }
        });
    }

    $('#btn-create-post').on('click', () => {
        postForm[0].reset();
        $('#post-id').val('');
        $('#post-modal-title').text('Create New Post');
        postModal.show();
    });

    postForm.on('submit', function(event) {
        event.preventDefault();

        const submitButton = postForm.find('button[type="submit"]');
        const originalButtonHtml = submitButton.html();

        submitButton.prop('disabled', true);
        submitButton.html(
            '<span class="spinner-border spinner-border-sm"></span>'
        );

        const postId = $('#post-id').val();
        const postTitle = $('#post-title').val();
        const postBody = $('#post-body').val();

        const postData = {
            title: postTitle,
            body: postBody,
            userId: 1 
        };

        const requestMethod = postId ? 'PUT' : 'POST';
        const requestUrl = postId ? apiUrl + '/' + postId : apiUrl;

        $.ajax({
            url: requestUrl,
            method: requestMethod,
            contentType: 'application/json',
            data: JSON.stringify(postData),
            success: function(response) {
                if (postId) {
                    showAlert('Post updated successfully!', 'success');
                    const row = postsList.find('tr[data-id="' + postId + '"]');
                    row.find('.post-title').text(response.title);
                    row.find('.post-body').text(response.body);
                } else {
                    showAlert('Post created successfully!', 'success');
                    const newRowHtml = createPostRowHtml(response);
                    postsList.prepend(newRowHtml);
                }
            },
            error: function(error) {
                showAlert('An error occurred. Please try again.', 'danger');
                console.error('Error:', error);
            },
            complete: function() {
                postModal.hide();
                submitButton.prop('disabled', false);
                submitButton.html(originalButtonHtml);
            }
        });
    });

    postsList.on('click', '.btn-edit', function() {
        const row = $(this).closest('tr');
        const postId = row.data('id');
        const postTitle = row.find('.post-title').text();
        const postBody = row.find('.post-body').text();

        $('#post-id').val(postId);
        $('#post-title').val(postTitle);
        $('#post-body').val(postBody);
        $('#post-modal-title').text('Edit Post');

        postModal.show();
    });

postsList.on('click', '.btn-delete', function() {
        const row = $(this).closest('tr');
        const postId = row.data('id');

        if (confirm('Are you sure you want to delete this post?')) {

            showAlert('Deleting post...', 'info');

            $.ajax({
                url: apiUrl + '/' + postId,
                method: 'DELETE',
                success: function() {
                    row.remove();
                    showAlert('Post deleted successfully!', 'success');
                },
                error: function(error) {
                    showAlert('Error deleting post. Please try again.', 'danger');
                    console.error('Error:', error);
                }
            });
        }
    });

    fetchPosts();

});