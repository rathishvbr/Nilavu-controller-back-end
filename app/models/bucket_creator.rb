
class BucketCreator

  def initialize(access)
    @helper = bildr_helper_is_ready.new(access)
    @bucket_name = access[:id]
    ensure_bucket_to_create?
  end


  def perform_create(force=false)
    raise Nilavu::InvalidParameters unless @helper.present?

    @helper.new_bucket(@bucket_name)
  end

  private

  def ensure_bucket_to_create?
    raise Nilavu::InvalidParameters unless @bucket_name
  end

  def bildr_helper_is_ready
      bildr = BackupRestore::StorageProvider.new
      return unless bildr.implementation
      bildr.implementation
  end

end
