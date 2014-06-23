require 'ostruct'
require 'erb'

plugin_slug = "wp-imgur"
version     = ENV['VERSION']
destination = "tmp/dist/#{version}"

namespace :git do
  desc "Update .gitignore"
  task :ignore do
    cp 'lib/templates/gitignore', '.gitignore'
    sh 'git add .gitignore'
    sh 'git commit -m "Updates .gitignore [ci-skip]"'
  end

  task :vendor do
    sh 'git add vendor'
    sh 'git commit -m "Adds vendor [ci-skip]"'
  end

  task :clean do
    sh 'rm -rf tmp'              if File.directory?('tmp')
    sh 'rm wp-cli.local.yml'     if File.exists?('wp-cli.local.yml')

    sh 'git rm *.json'
    sh 'git rm *.lock'
    sh 'git rm -r test'
    sh 'git rm -r bin'
    sh 'git rm phpunit.xml'
    sh 'git rm Gemfile'
    sh 'git rm Rakefile'

    sh 'git commit -m "Removes development files [ci-skip]"'
  end

  task :clear_after do
    sh 'git rm -r lib/templates' if File.directory?('lib/templates')
    sh 'git commit -m "Cleaning up after dist [ci-skip]"'
  end

  # todo: conditionally add js libs
  task :js do
  end

  task :archive do
    sh "rm -rf #{destination}" if File.directory?(destination)
    mkdir_p destination
    sh "git archive dist-#{version} --format tar | (cd tmp/dist/#{version} && tar xf -)"
  end

  task :dist_branch do
    sh "git checkout -b dist-#{version}"
  end

  task :dev_branch do
    sh "git checkout develop"
  end

  task :dist_publish do
    sh "git push origin dist-#{version}"
  end
end

namespace :ember do
  desc "Download Ember dependencies"
  task :download do
    sh "mkdir -p js/#{plugin_slug}/vendor/ember-validations/dist"
    sh "wget -O js/#{plugin_slug}/vendor/ember-validations/dist/ember-validations.js http://builds.dockyard.com.s3.amazonaws.com/ember-validations/release/ember-validations.js"
    sh "wget -O js/#{plugin_slug}/vendor/ember-validations/dist/ember-validations.min.js http://builds.dockyard.com.s3.amazonaws.com/ember-validations/release/ember-validations.min.js"

    sh "mkdir -p js/#{plugin_slug}/vendor/ember-easyForm/dist"
    sh "wget -O js/#{plugin_slug}/vendor/ember-easyForm/dist/ember-easyForm.js http://builds.dockyard.com.s3.amazonaws.com/ember-easyForm/release/ember-easyForm.js"
    sh "wget -O js/#{plugin_slug}/vendor/ember-easyForm/dist/ember-easyForm.min.js http://builds.dockyard.com.s3.amazonaws.com/ember-easyForm/release/ember-easyForm.min.js"
  end

  desc "Compiles Ember CLI App and copies into dist locations"
  task :dist do
    base = Dir.pwd
    Dir.chdir("js/#{plugin_slug}") do
      system({'WRAP_IN_EVAL' => '0'}, 'ember build --env development')

      cp "dist/assets/vendor.css"         ,  "#{base}/css/#{plugin_slug}-vendor.css"
      cp "dist/assets/#{plugin_slug}.css" ,  "#{base}/css/#{plugin_slug}-app.css"
      cp "dist/assets/vendor.js"          ,  "#{base}/js/#{plugin_slug}-vendor.js"
      cp "dist/assets/#{plugin_slug}.js"  ,  "#{base}/js/#{plugin_slug}-app.js"

      sh "ember build --env production"
      cp "dist/assets/vendor.css"         ,  "#{base}/css/#{plugin_slug}-vendor.min.css"
      cp "dist/assets/#{plugin_slug}.css" ,  "#{base}/css/#{plugin_slug}-app.min.css"
      cp "dist/assets/vendor.js"          ,  "#{base}/js/#{plugin_slug}-vendor.min.js"
      cp "dist/assets/#{plugin_slug}.js"  ,  "#{base}/js/#{plugin_slug}-app.min.js"
    end
  end

end

namespace :composer do
  desc "Update Composer dependencies"
  task :update do
    sh 'rm -rf vendor' if File.directory?('vendor')
    sh 'composer update'

    # todo: use porcelain if this isn't good enough
    changed = `git status`
    if !changed.include?('working directory clean')
      sh 'git add composer.lock'
      sh 'git commit -m "Fresh composer update [ci-skip]"'
    end
  end

  desc "Update Requirements.php"
  task :update_requirements do
    source = 'vendor/dsawardekar/wp-requirements/lib/MyWordPressPlugin/Requirements.php'
    contents = File.read(source)
    contents = contents.gsub('MyWordPressPlugin', 'WpSpoilerAlert')
    File.write('lib/WpSpoilerAlert/Requirements.php', contents)
  end
end

namespace :svn do
  desc "Copy files to svn trunk"
  task :copy do
    sh "rsync -a tmp/dist/#{version}/ ../svn/trunk --exclude=.gitignore"
  end

  desc "Add changed files to svn"
  task :add do
    Dir.chdir('../svn') do
      sh "svn add . --force"
    end
  end

  desc "Commit changed files to svn"
  task :commit do
    Dir.chdir('../svn/trunk') do
      sh "svn commit -m 'Release #{version}'"
    end
  end

  desc "Create release branch"
  task :branch do
    Dir.chdir('../svn') do
      repo  = "http://plugins.svn.wordpress.org/#{plugin_slug}"
      trunk = "#{repo}/trunk"
      tag   = "#{repo}/branches/#{version}"

      sh "svn copy #{trunk} #{tag} -m 'Release Branch: #{version}'"
    end
  end

  desc "Create release tag"
  task :tag do
    Dir.chdir('../svn') do
      repo  = "http://plugins.svn.wordpress.org/#{plugin_slug}"
      trunk = "#{repo}/trunk"
      tag   = "#{repo}/tags/#{version}"

      sh "svn copy #{trunk} #{tag} -m 'Release Tag: #{version}'"
    end
  end
end

namespace :github do
  desc 'Update spoiler.js'
  task 'update_spoilerjs' do
    url = 'https://raw.githubusercontent.com/joshbuddy/spoiler-alert/master/spoiler.js'
    sh "wget -O js/spoiler.js #{url}"
  end
end

namespace :generator do
  desc 'Generate Languages'
  task 'generate_languages' do
    languages = Dir.glob('js/languages/*.js').map do |file|
      File.basename(file, '.js')
    end

    template = ERB.new(File.read('lib/templates/Languages.php.erb'), nil, '-')
    opts = OpenStruct.new({
      :languages => languages
    })

    vars = opts.instance_eval { binding }
    File.write('lib/WpSyntaxHighlighter/Languages.php', template.result(vars))
  end

  desc 'Generate Themes'
  task 'generate_themes' do
    themes = Dir.glob('css/*.css').map do |file|
      File.basename(file, '.css')
    end

    template = ERB.new(File.read('lib/templates/Themes.php.erb'), nil, '-')
    opts = OpenStruct.new({
      :themes => themes
    })

    vars = opts.instance_eval { binding }
    File.write('lib/WpSyntaxHighlighter/Themes.php', template.result(vars))
  end
end

task :dist_check do
  fail "Version not specified" if version.nil?
end

desc 'Create a new Distribution'
task :dist => [
  'dist_check',
  'git:dist_branch',
  'composer:update',
  'git:clean',
  'git:ignore',
  'git:vendor',
  'git:clear_after',
  'git:dist_publish',
  'git:dev_branch'
]

desc 'Publish to wordpress.org'
task :publish => [
  'dist',
  'git:archive',
  'svn:copy',
  'svn:add',
  'svn:commit',
  'svn:branch',
  'svn:tag'
]

desc 'Initialize - after distribution'
task :init => [
  'composer:update'
]
