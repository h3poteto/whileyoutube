class StaticsController < ApplicationController
  before_action :set_static, only: [:show, :edit, :update, :destroy]

  # GET /statics
  # GET /statics.json
  def index
  end
end
