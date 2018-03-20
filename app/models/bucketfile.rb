# destroy bucket file using ceph helper
class Bucketfile
  attr_reader :bucket_name
  attr_reader :bucket_file
  attr_reader :acl

  def initialize(access)
    @helper = bildr_helper_is_ready.new(access)
    @bucket_name = access[:bucket_name]
    @bucketfile_name = access[:key]
    @acl = find_object_acl(access[:acl])

    ensure_bucket_to_destroy?
  end

  def destroy(action=nil)
    raise Nilavu::InvalidParameters unless @helper.present?
    @helper.destroy_object(@bucket_name, @bucketfile_name)
  end

  def set_acl
    raise Nilavu::InvalidParameters unless @helper.present?

    @helper.set_acl(@bucket_name, @bucketfile_name, @acl)
  end

  private

  def ensure_bucket_to_destroy?
    raise Nilavu::InvalidParameters unless @bucket_name && @bucketfile_name
  end

  def find_object_acl(aclKey)
    result = case aclKey
    when "private" then StorageEnum::PRIVATE
    when "public" then StorageEnum::PUBLIC
    else StorageEnum::PRIVATE
    end
    result
  end

  def bildr_helper_is_ready
      bildr = BackupRestore::StorageProvider.new
      return unless bildr.implementation
      bildr.implementation
  end

end
